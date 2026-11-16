-- Repair missing or partially installed attendance stats infrastructure.
-- Run the entire file in Supabase SQL Editor as postgres.
-- Requires the existing organization, profiles, leaves, attendance and admin_calendar tables.
-- Safe to rerun. Does not delete or backfill attendance records or summary rows.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create daily_attendance_stats table for pre-computed daily stats per organization
CREATE TABLE IF NOT EXISTS public.daily_attendance_stats (
    id BIGSERIAL PRIMARY KEY,
    organization_id INTEGER NOT NULL REFERENCES public.organization(id) ON DELETE CASCADE,
    stat_date DATE NOT NULL,
    total_employees INTEGER NOT NULL DEFAULT 0,
    present_count INTEGER NOT NULL DEFAULT 0,
    absent_count INTEGER NOT NULL DEFAULT 0,
    on_leave_count INTEGER NOT NULL DEFAULT 0,
    incomplete_count INTEGER NOT NULL DEFAULT 0,
    leave_days_total NUMERIC(6,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, stat_date)
);

-- Index for fast lookups by org and date
CREATE INDEX IF NOT EXISTS idx_daily_attendance_stats_org_date
    ON public.daily_attendance_stats (organization_id, stat_date DESC);

-- Enable RLS
ALTER TABLE public.daily_attendance_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can read all stats for their organization
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public'
        AND tablename = 'daily_attendance_stats'
        AND policyname = 'Admins can read org daily stats'
    ) THEN
        CREATE POLICY "Admins can read org daily stats"
    ON public.daily_attendance_stats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND organization_id = daily_attendance_stats.organization_id
            AND role = 'admin'
        )
    );
    END IF;
END;
$policy$;

-- Supervisors can read stats for their team members' organizations
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public'
        AND tablename = 'daily_attendance_stats'
        AND policyname = 'Supervisors can read org daily stats'
    ) THEN
        CREATE POLICY "Supervisors can read org daily stats"
    ON public.daily_attendance_stats
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND organization_id = daily_attendance_stats.organization_id
            AND role = 'supervisor'
        )
    );
    END IF;
END;
$policy$;

-- System (service role) can insert/update stats
DO $policy$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public'
        AND tablename = 'daily_attendance_stats'
        AND policyname = 'Service role can manage daily stats'
    ) THEN
        CREATE POLICY "Service role can manage daily stats"
    ON public.daily_attendance_stats
    FOR ALL
    USING (auth.role() = 'service_role');
    END IF;
END;
$policy$;


-- TIMESTAMPTZ already represents an instant; convert directly to Nepal time.
CREATE OR REPLACE FUNCTION public.nepal_date_from_utc(p_utc_timestamp TIMESTAMPTZ)
RETURNS DATE LANGUAGE sql IMMUTABLE AS $$
    SELECT (p_utc_timestamp AT TIME ZONE 'Asia/Kathmandu')::DATE;
$$;

CREATE OR REPLACE FUNCTION public.is_holiday_for_org(p_org_id INTEGER, p_date DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_calendar
        WHERE organization_id = p_org_id AND type = 'holiday'
          AND p_date BETWEEN start_date AND COALESCE(end_date, start_date)
    );
$$;

-- A missing end date represents a single day, not indefinite leave.
CREATE OR REPLACE FUNCTION public.is_user_on_leave(p_user_id UUID, p_date DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.leaves
        WHERE user_id = p_user_id AND status = 'approved'
          AND p_date BETWEEN start_date AND COALESCE(end_date, start_date)
    );
$$;

CREATE OR REPLACE FUNCTION public.mark_absent_employees()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_yesterday DATE := public.nepal_date_from_utc(NOW()) - 1;
    v_org_id INTEGER;
BEGIN
    IF EXTRACT(DOW FROM v_yesterday) = 6 THEN RETURN; END IF;

    FOR v_org_id IN SELECT id FROM public.organization LOOP
        IF public.is_holiday_for_org(v_org_id, v_yesterday) THEN CONTINUE; END IF;

        INSERT INTO public.attendance (user_id, date, status, created_at)
        SELECT p.id, v_yesterday, 'absent', NOW()
        FROM public.profiles p
        WHERE p.organization_id = v_org_id AND p.status = 'active'
          AND public.nepal_date_from_utc(p.created_at) <= v_yesterday
          AND NOT public.is_user_on_leave(p.id, v_yesterday)
          AND NOT EXISTS (
              SELECT 1 FROM public.attendance a
              WHERE a.user_id = p.id AND a.date = v_yesterday
          )
        ON CONFLICT (user_id, date) DO NOTHING;
    END LOOP;
END;
$$;

-- Daily and historical processing share the same calculation.
CREATE OR REPLACE FUNCTION public.backfill_daily_attendance_stats(
    p_start_date DATE, p_end_date DATE
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_current_date DATE := p_start_date;
    v_org_id INTEGER;
    v_total_employees INTEGER;
    v_present_count INTEGER;
    v_absent_count INTEGER;
    v_on_leave_count INTEGER;
    v_incomplete_count INTEGER;
    v_leave_days_total NUMERIC(6,2);
BEGIN
    WHILE v_current_date <= p_end_date LOOP
        IF EXTRACT(DOW FROM v_current_date) = 6 THEN
            v_current_date := v_current_date + 1;
            CONTINUE;
        END IF;

        FOR v_org_id IN SELECT id FROM public.organization LOOP
            IF public.is_holiday_for_org(v_org_id, v_current_date) THEN CONTINUE; END IF;

            SELECT COUNT(*) INTO v_total_employees
            FROM public.profiles
            WHERE organization_id = v_org_id AND status = 'active'
              AND public.nepal_date_from_utc(created_at) <= v_current_date;

            SELECT COUNT(*) FILTER (WHERE a.status = 'present'),
                   COUNT(*) FILTER (WHERE a.status = 'absent'),
                   COUNT(*) FILTER (WHERE a.status = 'incomplete')
            INTO v_present_count, v_absent_count, v_incomplete_count
            FROM public.attendance a
            JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = v_org_id AND a.date = v_current_date;

            -- Approved leave need not have a separate attendance row.
            SELECT COUNT(*) INTO v_on_leave_count
            FROM public.profiles p
            WHERE p.organization_id = v_org_id
              AND (public.is_user_on_leave(p.id, v_current_date) OR EXISTS (
                  SELECT 1 FROM public.attendance a
                  WHERE a.user_id = p.id AND a.date = v_current_date
                    AND a.status = 'on_leave'
              ));

            -- Allocate only this day's share; preserve half-day quantities.
            SELECT COALESCE(SUM(
                COALESCE(l.days_count,
                    COALESCE(l.end_date, l.start_date) - l.start_date + 1
                )::NUMERIC /
                NULLIF(COALESCE(l.end_date, l.start_date) - l.start_date + 1, 0)
            ), 0) INTO v_leave_days_total
            FROM public.leaves l
            JOIN public.profiles p ON p.id = l.user_id
            WHERE p.organization_id = v_org_id AND l.status = 'approved'
              AND v_current_date BETWEEN l.start_date AND COALESCE(l.end_date, l.start_date);

            INSERT INTO public.daily_attendance_stats (
                organization_id, stat_date, total_employees, present_count,
                absent_count, on_leave_count, incomplete_count, leave_days_total
            ) VALUES (
                v_org_id, v_current_date, v_total_employees, v_present_count,
                v_absent_count, v_on_leave_count, v_incomplete_count, v_leave_days_total
            )
            ON CONFLICT (organization_id, stat_date) DO UPDATE SET
                total_employees = EXCLUDED.total_employees,
                present_count = EXCLUDED.present_count,
                absent_count = EXCLUDED.absent_count,
                on_leave_count = EXCLUDED.on_leave_count,
                incomplete_count = EXCLUDED.incomplete_count,
                leave_days_total = EXCLUDED.leave_days_total,
                updated_at = NOW();
        END LOOP;
        v_current_date := v_current_date + 1;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.compute_daily_attendance_stats()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_yesterday DATE := public.nepal_date_from_utc(NOW()) - 1;
BEGIN
    PERFORM public.backfill_daily_attendance_stats(v_yesterday, v_yesterday);
END;
$$;

-- Preserve the maintenance-only access policy, including on fresh installs.
REVOKE EXECUTE ON FUNCTION public.mark_absent_employees() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_daily_attendance_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.backfill_daily_attendance_stats(DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_absent_employees() TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_daily_attendance_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.backfill_daily_attendance_stats(DATE, DATE) TO service_role;

-- View for easy querying of daily stats with org name
CREATE OR REPLACE VIEW public.v_daily_attendance_stats
WITH (security_invoker = true) AS
SELECT
    das.*,
    o.name AS organization_name
FROM public.daily_attendance_stats das
JOIN public.organization o ON o.id = das.organization_id;

-- Grant permissions
GRANT SELECT ON public.v_daily_attendance_stats TO authenticated;
GRANT SELECT ON public.daily_attendance_stats TO authenticated;
-- Schedule pg_cron jobs
-- Run at 18:30 UTC = 00:15 Nepal time (next day)
-- mark_absent_employees at 18:30 UTC
SELECT cron.schedule(
    'mark-absent-daily',
    '30 18 * * *',  -- 18:30 UTC daily
    $$SELECT public.mark_absent_employees();$$
);

-- compute_daily_attendance_stats at 18:35 UTC (5 minutes after)
SELECT cron.schedule(
    'compute-daily-stats',
    '35 18 * * *',  -- 18:35 UTC daily
    $$SELECT public.compute_daily_attendance_stats();$$
);


COMMIT;
