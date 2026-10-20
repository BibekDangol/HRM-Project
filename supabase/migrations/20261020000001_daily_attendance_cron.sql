-- Migration: Daily Attendance Cron Jobs
-- Created: 2026-10-20
-- Description: Creates daily_attendance_stats table, SQL functions for marking absent
-- and computing stats, and pg_cron jobs to run daily at 00:15 Nepal time (18:30 UTC)

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 1. Create daily_attendance_stats table for pre-computed daily stats per organization
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

-- Supervisors can read stats for their team members' organizations
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

-- System (service role) can insert/update stats
CREATE POLICY "Service role can manage daily stats"
    ON public.daily_attendance_stats
    FOR ALL
    USING (auth.role() = 'service_role');

-- 2. Function to check if a date is a holiday for an organization
CREATE OR REPLACE FUNCTION public.is_holiday_for_org(
    p_org_id INTEGER,
    p_date DATE
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_calendar
        WHERE organization_id = p_org_id
        AND type = 'holiday'
        AND start_date <= p_date
        AND (end_date IS NULL OR end_date >= p_date)
    );
$$;

-- 3. Function to check if a user is on approved leave for a specific date
CREATE OR REPLACE FUNCTION public.is_user_on_leave(
    p_user_id UUID,
    p_date DATE
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.leaves
        WHERE user_id = p_user_id
        AND status = 'approved'
        AND start_date <= p_date
        AND (end_date IS NULL OR end_date >= p_date)
    );
$$;

-- 4. Function to get Nepal date from UTC timestamp
CREATE OR REPLACE FUNCTION public.nepal_date_from_utc(p_utc_timestamp TIMESTAMPTZ)
RETURNS DATE
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT (p_utc_timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu')::DATE;
$$;

-- 5. Main function: Mark absent employees for yesterday (Nepal time)
-- Run this at 00:15 Nepal time (18:30 UTC previous day)
CREATE OR REPLACE FUNCTION public.mark_absent_employees()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_yesterday DATE := (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu' - INTERVAL '1 day')::DATE;
    v_org_id INTEGER;
    v_user_id UUID;
    v_user_created_date DATE;
    v_is_saturday BOOLEAN;
BEGIN
    -- Skip if yesterday was Saturday (Nepal weekend)
    v_is_saturday := EXTRACT(DOW FROM v_yesterday) = 6; -- 6 = Saturday in PostgreSQL (0=Sunday)
    IF v_is_saturday THEN
        RAISE NOTICE 'Skipping absent marking for Saturday: %', v_yesterday;
        RETURN;
    END IF;

    -- Loop through each organization
    FOR v_org_id IN SELECT id FROM public.organization LOOP
        -- Skip if yesterday was a holiday for this org
        IF public.is_holiday_for_org(v_org_id, v_yesterday) THEN
            RAISE NOTICE 'Skipping absent marking for org % on holiday: %', v_org_id, v_yesterday;
            CONTINUE;
        END IF;

        -- Find active users in this org who:
        -- 1. Were hired on or before yesterday
        -- 2. Don't have an attendance record for yesterday
        -- 3. Are not on approved leave for yesterday
        FOR v_user_id, v_user_created_date IN
            SELECT p.id, p.created_at::DATE
            FROM public.profiles p
            WHERE p.organization_id = v_org_id
            AND p.status = 'active'
            AND p.created_at::DATE <= v_yesterday
            AND NOT EXISTS (
                SELECT 1 FROM public.attendance a
                WHERE a.user_id = p.id
                AND a.date = v_yesterday
            )
            AND NOT public.is_user_on_leave(p.id, v_yesterday)
        LOOP
            -- Insert absent record
            INSERT INTO public.attendance (user_id, date, status, created_at)
            VALUES (v_user_id, v_yesterday, 'absent', NOW())
            ON CONFLICT (user_id, date) DO NOTHING;

            RAISE NOTICE 'Marked absent: user=% org=% date=%', v_user_id, v_org_id, v_yesterday;
        END LOOP;
    END LOOP;
END;
$$;

-- 6. Function: Compute daily attendance stats for all organizations
-- Run this after mark_absent_employees (e.g., at 00:20 Nepal time)
CREATE OR REPLACE FUNCTION public.compute_daily_attendance_stats()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_yesterday DATE := (NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Kathmandu' - INTERVAL '1 day')::DATE;
    v_org_id INTEGER;
    v_total_employees INTEGER;
    v_present_count INTEGER;
    v_absent_count INTEGER;
    v_on_leave_count INTEGER;
    v_incomplete_count INTEGER;
    v_leave_days_total NUMERIC(6,2);
BEGIN
    -- Loop through each organization
    FOR v_org_id IN SELECT id FROM public.organization LOOP
        -- Count total active employees hired before or on stat_date
        SELECT COUNT(*) INTO v_total_employees
        FROM public.profiles
        WHERE organization_id = v_org_id
        AND status = 'active'
        AND created_at::DATE <= v_yesterday;

        -- Count present (status = 'present')
        SELECT COUNT(*) INTO v_present_count
        FROM public.attendance a
        JOIN public.profiles p ON p.id = a.user_id
        WHERE p.organization_id = v_org_id
        AND a.date = v_yesterday
        AND a.status = 'present';

        -- Count absent (status = 'absent')
        SELECT COUNT(*) INTO v_absent_count
        FROM public.attendance a
        JOIN public.profiles p ON p.id = a.user_id
        WHERE p.organization_id = v_org_id
        AND a.date = v_yesterday
        AND a.status = 'absent';

        -- Count on_leave (status = 'on_leave')
        SELECT COUNT(*) INTO v_on_leave_count
        FROM public.attendance a
        JOIN public.profiles p ON p.id = a.user_id
        WHERE p.organization_id = v_org_id
        AND a.date = v_yesterday
        AND a.status = 'on_leave';

        -- Count incomplete (status = 'incomplete')
        SELECT COUNT(*) INTO v_incomplete_count
        FROM public.attendance a
        JOIN public.profiles p ON p.id = a.user_id
        WHERE p.organization_id = v_org_id
        AND a.date = v_yesterday
        AND a.status = 'incomplete';

        -- Sum leave days for approved leaves overlapping this date
        SELECT COALESCE(SUM(
            CASE
                WHEN l.days_count IS NOT NULL THEN l.days_count
                ELSE (
                    LEAST(l.end_date, v_yesterday) - GREATEST(l.start_date, v_yesterday) + 1
                )
            END
        ), 0) INTO v_leave_days_total
        FROM public.leaves l
        JOIN public.profiles p ON p.id = l.user_id
        WHERE p.organization_id = v_org_id
        AND l.status = 'approved'
        AND l.start_date <= v_yesterday
        AND (l.end_date IS NULL OR l.end_date >= v_yesterday);

        -- Upsert stats
        INSERT INTO public.daily_attendance_stats (
            organization_id, stat_date,
            total_employees, present_count, absent_count,
            on_leave_count, incomplete_count, leave_days_total
        ) VALUES (
            v_org_id, v_yesterday,
            v_total_employees, v_present_count, v_absent_count,
            v_on_leave_count, v_incomplete_count, v_leave_days_total
        )
        ON CONFLICT (organization_id, stat_date) DO UPDATE SET
            total_employees = EXCLUDED.total_employees,
            present_count = EXCLUDED.present_count,
            absent_count = EXCLUDED.absent_count,
            on_leave_count = EXCLUDED.on_leave_count,
            incomplete_count = EXCLUDED.incomplete_count,
            leave_days_total = EXCLUDED.leave_days_total,
            updated_at = NOW();

        RAISE NOTICE 'Computed stats for org % date %: total=%, present=%, absent=%, leave=%, incomplete=%',
            v_org_id, v_yesterday, v_total_employees, v_present_count, v_absent_count, v_on_leave_count, v_incomplete_count;
    END LOOP;
END;
$$;

-- 7. Function to backfill stats for a date range (optional, for historical data)
CREATE OR REPLACE FUNCTION public.backfill_daily_attendance_stats(
    p_start_date DATE,
    p_end_date DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
        -- Skip Saturdays
        IF EXTRACT(DOW FROM v_current_date) = 6 THEN
            v_current_date := v_current_date + INTERVAL '1 day';
            CONTINUE;
        END IF;

        FOR v_org_id IN SELECT id FROM public.organization LOOP
            -- Skip holidays
            IF public.is_holiday_for_org(v_org_id, v_current_date) THEN
                CONTINUE;
            END IF;

            SELECT COUNT(*) INTO v_total_employees
            FROM public.profiles
            WHERE organization_id = v_org_id
            AND status = 'active'
            AND created_at::DATE <= v_current_date;

            SELECT COUNT(*) INTO v_present_count
            FROM public.attendance a
            JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = v_org_id
            AND a.date = v_current_date
            AND a.status = 'present';

            SELECT COUNT(*) INTO v_absent_count
            FROM public.attendance a
            JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = v_org_id
            AND a.date = v_current_date
            AND a.status = 'absent';

            SELECT COUNT(*) INTO v_on_leave_count
            FROM public.attendance a
            JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = v_org_id
            AND a.date = v_current_date
            AND a.status = 'on_leave';

            SELECT COUNT(*) INTO v_incomplete_count
            FROM public.attendance a
            JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = v_org_id
            AND a.date = v_current_date
            AND a.status = 'incomplete';

            SELECT COALESCE(SUM(
                CASE
                    WHEN l.days_count IS NOT NULL THEN l.days_count
                    ELSE (
                        LEAST(l.end_date, v_current_date) - GREATEST(l.start_date, v_current_date) + 1
                    )
                END
            ), 0) INTO v_leave_days_total
            FROM public.leaves l
            JOIN public.profiles p ON p.id = l.user_id
            WHERE p.organization_id = v_org_id
            AND l.status = 'approved'
            AND l.start_date <= v_current_date
            AND (l.end_date IS NULL OR l.end_date >= v_current_date);

            INSERT INTO public.daily_attendance_stats (
                organization_id, stat_date,
                total_employees, present_count, absent_count,
                on_leave_count, incomplete_count, leave_days_total
            ) VALUES (
                v_org_id, v_current_date,
                v_total_employees, v_present_count, v_absent_count,
                v_on_leave_count, v_incomplete_count, v_leave_days_total
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

        v_current_date := v_current_date + INTERVAL '1 day';
    END LOOP;
END;
$$;

-- 8. Schedule pg_cron jobs
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

-- 9. Helper function to manually trigger (for testing)
-- SELECT public.mark_absent_employees();
-- SELECT public.compute_daily_attendance_stats();
-- SELECT public.backfill_daily_attendance_stats('2026-01-01', '2026-12-31');

-- 10. View for easy querying of daily stats with org name
CREATE OR REPLACE VIEW public.v_daily_attendance_stats AS
SELECT
    das.*,
    o.name AS organization_name
FROM public.daily_attendance_stats das
JOIN public.organization o ON o.id = das.organization_id;

-- Grant permissions
GRANT SELECT ON public.v_daily_attendance_stats TO authenticated;
GRANT SELECT ON public.daily_attendance_stats TO authenticated;