-- Apply the caller's organization policies when reading through the view.
ALTER VIEW public.v_daily_attendance_stats SET (security_invoker = true);

-- These SECURITY DEFINER functions are maintenance jobs, not client RPCs.
REVOKE EXECUTE ON FUNCTION public.mark_absent_employees() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.compute_daily_attendance_stats() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.backfill_daily_attendance_stats(DATE, DATE) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.mark_absent_employees() TO service_role;
GRANT EXECUTE ON FUNCTION public.compute_daily_attendance_stats() TO service_role;
GRANT EXECUTE ON FUNCTION public.backfill_daily_attendance_stats(DATE, DATE) TO service_role;
