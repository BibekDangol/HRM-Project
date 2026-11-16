// Isolated PostgreSQL tests; no connection to the project's database.
// Install the test runtime outside the repo:
// npm install --prefix /tmp/hrm-sql-test --no-package-lock --ignore-scripts @electric-sql/pglite
// PGLITE_MODULE=/tmp/hrm-sql-test/node_modules/@electric-sql/pglite node --test scripts/database-regressions.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');

const read = file => readFileSync(path.join(__dirname, '..', file), 'utf8');

test('attendance migrations enforce tenant permissions and calculate daily leave correctly', async () => {
  const db = new PGlite();
  try {
    // Minimal schema needed by the migrations, isolated in this in-memory DB.
    await db.exec(`
      CREATE ROLE anon;
      CREATE ROLE authenticated;
      CREATE ROLE service_role;
      CREATE SCHEMA auth;
      CREATE SCHEMA cron;
      CREATE TABLE cron.job (jobname TEXT PRIMARY KEY, schedule TEXT, command TEXT);
      CREATE FUNCTION cron.schedule(p_name TEXT, p_schedule TEXT, p_command TEXT)
      RETURNS INTEGER LANGUAGE plpgsql AS $$
      BEGIN
        INSERT INTO cron.job VALUES (p_name, p_schedule, p_command)
        ON CONFLICT (jobname) DO UPDATE SET schedule = EXCLUDED.schedule, command = EXCLUDED.command;
        RETURN 1;
      END;
      $$;
      CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql STABLE AS $$
        SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
      $$;
      CREATE FUNCTION auth.role() RETURNS TEXT LANGUAGE sql STABLE AS $$ SELECT current_user::TEXT; $$;
      CREATE TABLE organization (id INTEGER PRIMARY KEY, name TEXT);
      CREATE TABLE profiles (
        id UUID PRIMARY KEY, organization_id INTEGER, role TEXT, status TEXT, created_at TIMESTAMPTZ
      );
      CREATE TABLE admin_calendar (
        organization_id INTEGER, type TEXT, start_date DATE, end_date DATE
      );
      CREATE TABLE leaves (
        user_id UUID, status TEXT, start_date DATE, end_date DATE, days_count NUMERIC
      );
      CREATE TABLE attendance (
        user_id UUID, date DATE, status TEXT, created_at TIMESTAMPTZ, UNIQUE(user_id, date)
      );
      GRANT USAGE ON SCHEMA auth TO authenticated;
      GRANT SELECT ON organization, profiles TO authenticated;
      INSERT INTO organization VALUES (1, 'First'), (2, 'Second');
      INSERT INTO profiles VALUES
        ('00000000-0000-0000-0000-000000000001', 1, 'admin', 'active', '2026-01-01Z'),
        ('00000000-0000-0000-0000-000000000002', 2, 'admin', 'active', '2026-01-01Z'),
        ('00000000-0000-0000-0000-000000000003', 1, 'user', 'active', '2026-01-01Z');
    `);
    // PGlite has no scheduler; execute all original schema/function statements.
    const original = read('supabase/migrations/20261020000001_daily_attendance_cron.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS pg_cron;', '')
      .replace(/SELECT cron\.schedule\([\s\S]*?^\);/gm, '');
    await db.exec(original);
    await db.exec(read('supabase/migrations/20261105000001_secure_attendance_stats.sql'));
    await db.exec(read('supabase/migrations/20261105000002_fix_attendance_calculations.sql'));
    await db.exec(read('supabase/tests/attendance_stats_security.sql'));

    const repair = read('supabase/repair_attendance_setup.sql')
      .replace('CREATE EXTENSION IF NOT EXISTS pg_cron;', '');
    // Reproduce the reported deployment: the view was never installed.
    await db.exec('DROP VIEW public.v_daily_attendance_stats');
    await db.exec(repair);
    await db.exec(read('supabase/tests/attendance_stats_security.sql'));

    for (const timezone of ['UTC', 'America/New_York', 'Asia/Kathmandu']) {
      await db.exec(`SET TIME ZONE '${timezone}'`);
      const result = await db.query(`SELECT
        public.nepal_date_from_utc('2026-11-04T18:14:59Z')::TEXT AS before_midnight,
        public.nepal_date_from_utc('2026-11-04T18:15:00Z')::TEXT AS midnight`);
      assert.equal(result.rows[0].before_midnight, '2026-11-04');
      assert.equal(result.rows[0].midnight, '2026-11-05');
    }

    await db.exec(`
      INSERT INTO leaves VALUES
        ('00000000-0000-0000-0000-000000000001', 'approved', '2026-11-03', '2026-11-05', 3),
        ('00000000-0000-0000-0000-000000000003', 'approved', '2026-11-04', '2026-11-04', 0.5),
        ('00000000-0000-0000-0000-000000000003', 'approved', '2026-10-01', NULL, 1);
      INSERT INTO attendance VALUES
        ('00000000-0000-0000-0000-000000000001', '2026-11-04', 'on_leave', NOW());
      INSERT INTO admin_calendar VALUES (2, 'holiday', '2026-11-04', '2026-11-04');
      INSERT INTO admin_calendar VALUES (2, 'holiday', '2026-10-01', NULL);
      SELECT public.backfill_daily_attendance_stats('2026-11-03', '2026-11-07');
    `);
    const stats = await db.query(`SELECT stat_date::TEXT, leave_days_total::TEXT, on_leave_count
      FROM daily_attendance_stats WHERE organization_id = 1 ORDER BY stat_date`);
    assert.deepEqual(stats.rows.map(row => Number(row.leave_days_total)), [1, 1.5, 1, 0]);
    assert.deepEqual(stats.rows.map(row => row.on_leave_count), [1, 2, 1, 0]);
    assert.equal(stats.rows.some(row => row.stat_date === '2026-11-07'), false);
    const holiday = await db.query(`SELECT * FROM daily_attendance_stats
      WHERE organization_id = 2 AND stat_date = '2026-11-04'`);
    assert.equal(holiday.rows.length, 0);
    const singleDay = await db.query(`SELECT public.is_user_on_leave(
      '00000000-0000-0000-0000-000000000003', '2026-10-02') AS on_leave`);
    assert.equal(singleDay.rows[0].on_leave, false);
    const singleHoliday = await db.query(`SELECT public.is_holiday_for_org(2, '2026-10-02') AS holiday`);
    assert.equal(singleHoliday.rows[0].holiday, false);
    // Upserts must be repeatable without doubling totals.
    await db.exec(`SELECT public.backfill_daily_attendance_stats('2026-11-03', '2026-11-07')`);
    const repeated = await db.query(`SELECT SUM(leave_days_total)::TEXT AS total
      FROM daily_attendance_stats WHERE organization_id = 1`);
    assert.equal(Number(repeated.rows[0].total), 3.5);
    // A repeat repair must preserve summaries and leave only two named jobs.
    await db.exec(repair);
    const preserved = await db.query(`SELECT SUM(leave_days_total)::TEXT AS total
      FROM daily_attendance_stats WHERE organization_id = 1`);
    assert.equal(Number(preserved.rows[0].total), 3.5);
    const jobs = await db.query('SELECT jobname, schedule FROM cron.job ORDER BY jobname');
    assert.deepEqual(jobs.rows, [
      { jobname: 'compute-daily-stats', schedule: '35 18 * * *' },
      { jobname: 'mark-absent-daily', schedule: '30 18 * * *' },
    ]);

    await db.exec(`
      SET ROLE authenticated;
      SET request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
    `);
    const visible = await db.query('SELECT DISTINCT organization_id FROM v_daily_attendance_stats');
    assert.deepEqual(visible.rows, [{ organization_id: 1 }]);
    await assert.rejects(db.query('SELECT public.mark_absent_employees()'), /permission denied/);
    await db.exec('RESET ROLE');

    // Exercise both scheduled entry points without changing cron jobs.
    await db.exec('SELECT public.mark_absent_employees(); SELECT public.compute_daily_attendance_stats();');
    const wrongAbsenceDate = await db.query(`SELECT COUNT(*)::INTEGER AS count FROM attendance
      WHERE status = 'absent' AND date <> public.nepal_date_from_utc(NOW()) - 1`);
    assert.equal(wrongAbsenceDate.rows[0].count, 0);

    // Also handle databases with none of the initial stats setup installed.
    await db.exec(`
      DROP TABLE daily_attendance_stats CASCADE;
      DROP FUNCTION mark_absent_employees();
      DROP FUNCTION compute_daily_attendance_stats();
      DROP FUNCTION backfill_daily_attendance_stats(DATE, DATE);
    `);
    await db.exec(repair);
    await db.exec(read('supabase/tests/attendance_stats_security.sql'));
    await db.exec(`SELECT public.backfill_daily_attendance_stats('2026-11-03', '2026-11-05')`);
    const restored = await db.query(`SELECT SUM(leave_days_total)::TEXT AS total
      FROM daily_attendance_stats WHERE organization_id = 1`);
    assert.equal(Number(restored.rows[0].total), 3.5);
  } finally {
    await db.close();
  }
});
