-- Run against a local/test database after applying migrations, as its owner:
-- psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/attendance_stats_security.sql
BEGIN;
DO $$
DECLARE
    maintenance_function REGPROCEDURE;
    client_role TEXT;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class
        WHERE oid = 'public.v_daily_attendance_stats'::REGCLASS
          AND 'security_invoker=true' = ANY(reloptions)
    ) THEN
        RAISE EXCEPTION 'Attendance view must enforce caller RLS';
    END IF;

    FOREACH maintenance_function IN ARRAY ARRAY[
        'public.mark_absent_employees()'::REGPROCEDURE,
        'public.compute_daily_attendance_stats()'::REGPROCEDURE,
        'public.backfill_daily_attendance_stats(date,date)'::REGPROCEDURE
    ] LOOP
        FOREACH client_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
            IF has_function_privilege(client_role, maintenance_function, 'EXECUTE') THEN
                RAISE EXCEPTION '% can execute maintenance function %', client_role, maintenance_function;
            END IF;
        END LOOP;
        IF NOT has_function_privilege('service_role', maintenance_function, 'EXECUTE') THEN
            RAISE EXCEPTION 'Service role cannot execute %', maintenance_function;
        END IF;
    END LOOP;
END;
$$;
ROLLBACK;
