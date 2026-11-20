-- Requires 20261117000001_calendar_weekend_settings.sql and the attendance setup.
-- Recalculates leave durations and derived summaries. Raw attendance records are preserved.
BEGIN;

-- Match BIGINT organization foreign keys without narrowing IDs in triggers.
-- Recreate our policies in the same transaction because PostgreSQL blocks type
-- changes while a policy references the column. Their access rules are unchanged.
DO $upgrade$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'calendar_settings'
          AND column_name = 'organization_id' AND data_type <> 'bigint'
    ) THEN
        DROP POLICY IF EXISTS "Members read their calendar settings" ON public.calendar_settings;
        DROP POLICY IF EXISTS "Admins insert their calendar settings" ON public.calendar_settings;
        DROP POLICY IF EXISTS "Admins update their calendar settings" ON public.calendar_settings;
        ALTER TABLE public.calendar_settings ALTER COLUMN organization_id TYPE BIGINT;
        CREATE POLICY "Members read their calendar settings"
        ON public.calendar_settings FOR SELECT TO authenticated
        USING (organization_id = (
            SELECT organization_id FROM public.profiles WHERE id = (SELECT auth.uid())
        ));

        CREATE POLICY "Admins insert their calendar settings"
        ON public.calendar_settings FOR INSERT TO authenticated
        WITH CHECK (organization_id = (
            SELECT organization_id FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        ));

        CREATE POLICY "Admins update their calendar settings"
        ON public.calendar_settings FOR UPDATE TO authenticated
        USING (organization_id = (
            SELECT organization_id FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        ))
        WITH CHECK (organization_id = (
            SELECT organization_id FROM public.profiles
            WHERE id = (SELECT auth.uid()) AND role = 'admin'
        ));
    END IF;
END;
$upgrade$;

-- Remove earlier INTEGER signatures so RPC requests resolve to a single function.
-- No CASCADE: unrelated dependent objects are never dropped.
DROP FUNCTION IF EXISTS public.calculate_leave_days(INTEGER, DATE, DATE, TEXT);
DROP FUNCTION IF EXISTS public.refresh_org_calendar_calculations(INTEGER);
DROP FUNCTION IF EXISTS public.rebuild_org_attendance_stats(INTEGER, DATE, DATE);
DROP FUNCTION IF EXISTS public.is_non_working_day_for_org(INTEGER, DATE);

CREATE OR REPLACE FUNCTION public.is_non_working_day_for_org(p_org_id BIGINT, p_date DATE)
RETURNS BOOLEAN LANGUAGE sql STABLE SET search_path = '' AS $$
    SELECT EXTRACT(DOW FROM p_date)::INTEGER = ANY(COALESCE(
        (SELECT weekend_days FROM public.calendar_settings WHERE organization_id = p_org_id),
        ARRAY[0, 6]
    )) OR EXISTS (
        SELECT 1 FROM public.admin_calendar
        WHERE organization_id = p_org_id AND type = 'holiday'
          AND p_date BETWEEN start_date AND COALESCE(end_date, start_date)
    );
$$;

-- Older clients stored morning half-day requests as MORNING.
CREATE OR REPLACE FUNCTION public.normalize_leave_day_type(p_day_type TEXT)
RETURNS TEXT LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
    SELECT CASE UPPER(BTRIM(COALESCE(p_day_type, 'FULL')))
        WHEN 'MORNING' THEN 'FIRST_SHIFT'
        ELSE UPPER(BTRIM(COALESCE(p_day_type, 'FULL')))
    END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_leave_days(
    p_organization_id BIGINT, p_start_date DATE, p_end_date DATE, p_day_type TEXT DEFAULT 'FULL'
)
RETURNS NUMERIC LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE
    v_type TEXT := public.normalize_leave_day_type(p_day_type);
    v_days INTEGER;
BEGIN
    IF p_organization_id IS NULL OR p_start_date IS NULL OR p_end_date IS NULL
       OR p_end_date < p_start_date OR p_end_date - p_start_date > 3660 THEN
        RAISE EXCEPTION 'Choose a valid leave date range of at most ten years.' USING ERRCODE = '22023';
    END IF;
    IF current_user = 'authenticated' AND NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND organization_id = p_organization_id
    ) THEN
        RAISE EXCEPTION 'You cannot access this organization.' USING ERRCODE = '42501';
    END IF;
    IF v_type NOT IN ('FULL', 'FIRST_SHIFT', 'SECOND_SHIFT') THEN
        RAISE EXCEPTION 'Unrecognized leave day type: %', p_day_type USING ERRCODE = '22023';
    END IF;
    IF v_type <> 'FULL' AND p_start_date <> p_end_date THEN
        RAISE EXCEPTION 'Half-day leave must use a single date.' USING ERRCODE = '22023';
    END IF;
    SELECT COUNT(*) INTO v_days
    FROM generate_series(0, p_end_date - p_start_date) AS offset_days(day_offset)
    WHERE NOT public.is_non_working_day_for_org(p_organization_id, p_start_date + day_offset);
    RETURN CASE WHEN v_type <> 'FULL' AND v_days > 0 THEN 0.5 ELSE v_days END;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_leave_working_days()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = '' AS $$
DECLARE
    v_org_id BIGINT;
BEGIN
    SELECT organization_id INTO v_org_id FROM public.profiles WHERE id = NEW.user_id;
    IF v_org_id IS NULL OR NEW.organization_id IS DISTINCT FROM v_org_id THEN
        RAISE EXCEPTION 'The leave request must belong to the employee organization.' USING ERRCODE = '42501';
    END IF;
    NEW.day_type := public.normalize_leave_day_type(NEW.day_type);
    NEW.days_count := public.calculate_leave_days(
        NEW.organization_id, NEW.start_date, COALESCE(NEW.end_date, NEW.start_date), NEW.day_type
    );
    IF NEW.days_count = 0 THEN
        -- Existing requests can become zero-day after a holiday or weekend rule changes.
        IF TG_OP = 'INSERT' THEN
            RAISE EXCEPTION 'Choose at least one working day for leave.' USING ERRCODE = '22023';
        ELSIF NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date
           OR NEW.day_type IS DISTINCT FROM public.normalize_leave_day_type(OLD.day_type)
           OR NEW.user_id IS DISTINCT FROM OLD.user_id
           OR NEW.organization_id IS DISTINCT FROM COALESCE(OLD.organization_id, v_org_id) THEN
            RAISE EXCEPTION 'Choose at least one working day for leave.' USING ERRCODE = '22023';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_leave_working_days ON public.leaves;
CREATE TRIGGER enforce_leave_working_days
BEFORE INSERT OR UPDATE OF start_date, end_date, day_type, organization_id, user_id, days_count
ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.enforce_leave_working_days();

CREATE OR REPLACE FUNCTION public.mark_absent_employees()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_yesterday DATE := public.nepal_date_from_utc(NOW()) - 1;
    v_org_id BIGINT;
BEGIN
    FOR v_org_id IN SELECT id FROM public.organization LOOP
        IF public.is_non_working_day_for_org(v_org_id, v_yesterday) THEN CONTINUE; END IF;
        INSERT INTO public.attendance (user_id, date, status, created_at)
        SELECT p.id, v_yesterday, 'absent', NOW()
        FROM public.profiles p
        WHERE p.organization_id = v_org_id AND p.status = 'active'
          AND public.nepal_date_from_utc(p.created_at) <= v_yesterday
          AND NOT public.is_user_on_leave(p.id, v_yesterday)
          AND NOT EXISTS (
              SELECT 1 FROM public.attendance a WHERE a.user_id = p.id AND a.date = v_yesterday
          )
        ON CONFLICT (user_id, date) DO NOTHING;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.rebuild_org_attendance_stats(
    p_org_id BIGINT, p_start_date DATE, p_end_date DATE
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_date DATE := p_start_date;
    v_total INTEGER;
    v_present INTEGER;
    v_absent INTEGER;
    v_incomplete INTEGER;
    v_on_leave INTEGER;
    v_leave_days NUMERIC;
BEGIN
    WHILE v_date <= p_end_date LOOP
        IF public.is_non_working_day_for_org(p_org_id, v_date) THEN
            DELETE FROM public.daily_attendance_stats WHERE organization_id = p_org_id AND stat_date = v_date;
        ELSE
            SELECT COUNT(*) INTO v_total FROM public.profiles
            WHERE organization_id = p_org_id AND status = 'active'
              AND public.nepal_date_from_utc(created_at) <= v_date;
            SELECT COUNT(*) FILTER (WHERE a.status = 'present'),
                   COUNT(*) FILTER (WHERE a.status = 'absent'),
                   COUNT(*) FILTER (WHERE a.status = 'incomplete')
            INTO v_present, v_absent, v_incomplete
            FROM public.attendance a JOIN public.profiles p ON p.id = a.user_id
            WHERE p.organization_id = p_org_id AND a.date = v_date;
            SELECT COUNT(*) INTO v_on_leave FROM public.profiles p
            WHERE p.organization_id = p_org_id AND (
                public.is_user_on_leave(p.id, v_date) OR EXISTS (
                    SELECT 1 FROM public.attendance a WHERE a.user_id = p.id
                      AND a.date = v_date AND a.status = 'on_leave'
                )
            );
            SELECT COALESCE(SUM(CASE WHEN public.normalize_leave_day_type(l.day_type) IN ('FIRST_SHIFT', 'SECOND_SHIFT') THEN 0.5 ELSE 1 END), 0)
            INTO v_leave_days FROM public.leaves l
            JOIN public.profiles p ON p.id = l.user_id
            WHERE p.organization_id = p_org_id AND l.status = 'approved'
              AND v_date BETWEEN l.start_date AND COALESCE(l.end_date, l.start_date);
            INSERT INTO public.daily_attendance_stats (
                organization_id, stat_date, total_employees, present_count, absent_count,
                on_leave_count, incomplete_count, leave_days_total
            ) VALUES (p_org_id, v_date, v_total, v_present, v_absent, v_on_leave, v_incomplete, v_leave_days)
            ON CONFLICT (organization_id, stat_date) DO UPDATE SET
                total_employees = EXCLUDED.total_employees, present_count = EXCLUDED.present_count,
                absent_count = EXCLUDED.absent_count, on_leave_count = EXCLUDED.on_leave_count,
                incomplete_count = EXCLUDED.incomplete_count, leave_days_total = EXCLUDED.leave_days_total,
                updated_at = NOW();
        END IF;
        v_date := v_date + 1;
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.backfill_daily_attendance_stats(p_start_date DATE, p_end_date DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_org_id BIGINT;
BEGIN
    FOR v_org_id IN SELECT id FROM public.organization LOOP
        PERFORM public.rebuild_org_attendance_stats(v_org_id, p_start_date, p_end_date);
    END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_org_calendar_calculations(p_org_id BIGINT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_start DATE; v_end DATE;
BEGIN
    UPDATE public.leaves l SET organization_id = p_org_id,
        day_type = public.normalize_leave_day_type(l.day_type),
        days_count = public.calculate_leave_days(
        p_org_id, l.start_date, COALESCE(l.end_date, l.start_date), l.day_type
    ) FROM public.profiles p
    WHERE p.id = l.user_id AND p.organization_id = p_org_id
      AND (l.organization_id IS NULL OR l.organization_id = p_org_id)
      AND (l.organization_id IS NULL OR l.day_type IS DISTINCT FROM public.normalize_leave_day_type(l.day_type)
           OR l.days_count IS DISTINCT FROM public.calculate_leave_days(
          p_org_id, l.start_date, COALESCE(l.end_date, l.start_date), l.day_type
      ));
    SELECT MIN(day), MAX(day) INTO v_start, v_end FROM (
        SELECT stat_date AS day FROM public.daily_attendance_stats WHERE organization_id = p_org_id
        UNION ALL
        SELECT a.date FROM public.attendance a JOIN public.profiles p ON p.id = a.user_id
        WHERE p.organization_id = p_org_id
        UNION ALL
        SELECT l.start_date FROM public.leaves l WHERE l.organization_id = p_org_id
          AND l.start_date <= public.nepal_date_from_utc(NOW())
        UNION ALL
        SELECT LEAST(COALESCE(l.end_date, l.start_date), public.nepal_date_from_utc(NOW()))
        FROM public.leaves l WHERE l.organization_id = p_org_id
          AND l.start_date <= public.nepal_date_from_utc(NOW())
    ) AS source_dates;
    IF v_start IS NOT NULL THEN
        PERFORM public.rebuild_org_attendance_stats(p_org_id, v_start, v_end);
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_org_calendar_calculations()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_org_id BIGINT;
BEGIN
    IF TG_TABLE_NAME = 'admin_calendar' THEN
        IF COALESCE(NEW.type, '') <> 'holiday' AND COALESCE(OLD.type, '') <> 'holiday' THEN
            RETURN NULL;
        END IF;
    END IF;
    FOR v_org_id IN SELECT DISTINCT id FROM unnest(ARRAY[OLD.organization_id, NEW.organization_id]) AS orgs(id)
                    WHERE id IS NOT NULL LOOP
        IF (SELECT auth.role()) = 'authenticated' AND NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid())
              AND organization_id = v_org_id AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Only organization admins can change calendar rules.' USING ERRCODE = '42501';
        END IF;
        PERFORM public.refresh_org_calendar_calculations(v_org_id);
    END LOOP;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_weekend_calculations ON public.calendar_settings;
CREATE TRIGGER sync_weekend_calculations AFTER INSERT OR DELETE OR UPDATE OF weekend_days, organization_id
ON public.calendar_settings FOR EACH ROW EXECUTE FUNCTION public.sync_org_calendar_calculations();
DROP TRIGGER IF EXISTS sync_holiday_calculations ON public.admin_calendar;
CREATE TRIGGER sync_holiday_calculations AFTER INSERT OR DELETE OR UPDATE OF start_date, end_date, type, organization_id
ON public.admin_calendar FOR EACH ROW EXECUTE FUNCTION public.sync_org_calendar_calculations();

CREATE OR REPLACE FUNCTION public.get_user_attendance_summary(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE(present BIGINT, absent BIGINT, incomplete BIGINT, leave_taken NUMERIC)
LANGUAGE plpgsql STABLE SET search_path = '' AS $$
DECLARE v_org_id BIGINT; v_supervisor_id UUID; v_leave NUMERIC;
BEGIN
    IF p_start_date IS NULL OR p_end_date IS NULL OR p_end_date < p_start_date THEN
        RAISE EXCEPTION 'Choose a valid summary date range.' USING ERRCODE = '22023';
    END IF;
    SELECT organization_id, supervisor_id INTO v_org_id, v_supervisor_id
    FROM public.profiles WHERE id = p_user_id;
    IF v_org_id IS NULL THEN RAISE EXCEPTION 'Employee not found.'; END IF;
    IF current_user = 'authenticated' AND p_user_id IS DISTINCT FROM (SELECT auth.uid())
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles caller
           WHERE caller.id = (SELECT auth.uid()) AND caller.organization_id = v_org_id
             AND (caller.role = 'admin' OR (caller.role = 'supervisor' AND caller.id = v_supervisor_id))
       ) THEN
        RAISE EXCEPTION 'You cannot access this employee summary.' USING ERRCODE = '42501';
    END IF;
    SELECT COALESCE(SUM(public.calculate_leave_days(
        v_org_id, GREATEST(l.start_date, p_start_date),
        LEAST(COALESCE(l.end_date, l.start_date), p_end_date), l.day_type
    )), 0) INTO v_leave FROM public.leaves l
    WHERE l.user_id = p_user_id AND l.status = 'approved'
      AND l.start_date <= p_end_date AND COALESCE(l.end_date, l.start_date) >= p_start_date;
    RETURN QUERY SELECT COUNT(*) FILTER (WHERE a.status = 'present'),
        COUNT(*) FILTER (WHERE a.status = 'absent'),
        COUNT(*) FILTER (WHERE a.status = 'incomplete'), v_leave
    FROM public.attendance a WHERE a.user_id = p_user_id AND a.date BETWEEN p_start_date AND p_end_date
      AND NOT public.is_non_working_day_for_org(v_org_id, a.date);
END;
$$;

REVOKE ALL ON FUNCTION public.normalize_leave_day_type(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_non_working_day_for_org(BIGINT, DATE) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.calculate_leave_days(BIGINT, DATE, DATE, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_user_attendance_summary(UUID, DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_leave_day_type(TEXT),
    public.is_non_working_day_for_org(BIGINT, DATE),
    public.calculate_leave_days(BIGINT, DATE, DATE, TEXT),
    public.get_user_attendance_summary(UUID, DATE, DATE) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.enforce_leave_working_days(), public.sync_org_calendar_calculations(),
    public.refresh_org_calendar_calculations(BIGINT),
    public.rebuild_org_attendance_stats(BIGINT, DATE, DATE) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_org_calendar_calculations(BIGINT),
    public.rebuild_org_attendance_stats(BIGINT, DATE, DATE) TO service_role;
REVOKE ALL ON FUNCTION public.mark_absent_employees(), public.backfill_daily_attendance_stats(DATE, DATE)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mark_absent_employees(), public.backfill_daily_attendance_stats(DATE, DATE)
    TO service_role;

-- Bring existing saved requests and summaries into agreement with the current calendar.
DO $$ DECLARE v_org_id BIGINT; BEGIN
    FOR v_org_id IN SELECT id FROM public.organization LOOP
        PERFORM public.refresh_org_calendar_calculations(v_org_id);
    END LOOP;
END; $$;
COMMIT;
