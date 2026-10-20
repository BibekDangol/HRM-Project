# Daily Attendance Cron Jobs

## Overview
This migration sets up automated daily attendance processing:
1. **Marks absent employees** at 00:15 Nepal time (18:30 UTC)
2. **Computes daily attendance stats** at 00:20 Nepal time (18:35 UTC)
3. Stores pre-computed stats in `daily_attendance_stats` table for fast dashboard queries

## Tables Created
- `daily_attendance_stats` - Pre-computed daily attendance stats per organization

## Functions Created
- `is_holiday_for_org(org_id, date)` - Check if date is holiday for org
- `is_user_on_leave(user_id, date)` - Check if user has approved leave on date
- `nepal_date_from_utc(utc_timestamp)` - Convert UTC to Nepal date
- `mark_absent_employees()` - Main function to mark absent employees
- `compute_daily_attendance_stats()` - Compute daily stats per org
- `backfill_daily_attendance_stats(start_date, end_date)` - Backfill historical stats

## Cron Jobs (pg_cron)
- `mark-absent-daily` - Runs daily at 18:30 UTC (00:15 Nepal)
- `compute-daily-stats` - Runs daily at 18:35 UTC (00:20 Nepal)

## Deployment

### 1. Apply Migration
```bash
# If linked to Supabase project
npx supabase db push

# Or apply manually via Supabase Dashboard SQL Editor
# Copy contents of supabase/migrations/20261020000001_daily_attendance_cron.sql
```

### 2. Verify pg_cron is Enabled
In Supabase Dashboard → Database → Extensions, ensure `pg_cron` is enabled.

### 3. Verify Cron Jobs
```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### 4. Manual Testing
```sql
-- Test mark absent (use yesterday's date)
SELECT public.mark_absent_employees();

-- Test compute stats
SELECT public.compute_daily_attendance_stats();

-- Check results
SELECT * FROM public.daily_attendance_stats ORDER BY stat_date DESC LIMIT 10;

-- Backfill historical data (optional)
SELECT public.backfill_daily_attendance_stats('2026-01-01', '2026-12-31');
```

## Timezone Handling
- All cron times are in **UTC** (Supabase requirement)
- 00:15 Nepal = 18:30 UTC previous day
- 00:20 Nepal = 18:35 UTC previous day
- Functions use `AT TIME ZONE 'Asia/Kathmandu'` for Nepal date calculations

## Weekend/Holiday Logic
- **Skips Saturdays** (Nepal weekend) - no absent marking
- **Skips org holidays** from `admin_calendar` where `type = 'holiday'`
- Only marks absent for users hired **on or before** the target date
- Users on **approved leave** are not marked absent

## TypeScript Integration
New types in `src/types/dailyAttendanceStats.ts`:
- `DailyAttendanceStatsRow`
- `DailyAttendanceStatsInsert`
- `DailyAttendanceStatsUpdate`

New service in `src/services/users/dailyAttendanceStats.service.ts`:
- `getDailyAttendanceStatsService(orgId, startDate, endDate)`
- `getLatestDailyAttendanceStatsService(orgId, limit)`
- `getDailyAttendanceStatsByDateService(orgId, statDate)`
- `getOrganizationDailyAttendanceSummaryService(orgId, year, month)`

New hooks in `src/hooks/users/useDailyAttendanceStats.ts`:
- `useDailyAttendanceStats(orgId, startDate, endDate)`
- `useLatestDailyAttendanceStats(orgId, limit)`
- `useDailyAttendanceStatsByDate(orgId, statDate)`
- `useOrganizationDailyAttendanceSummary(orgId, year, month)`

## RLS Policies
- Admins/Supervisors can read stats for their organization
- Service role can insert/update (for cron jobs)
- Uses existing `profiles` table `role` and `organization_id`

## Monitoring
Check cron job status:
```sql
SELECT jobname, schedule, command, 
       (SELECT count(*) FROM cron.job_run_details jrd 
        WHERE jrd.jobid = cj.jobid 
        AND jrd.start_time > NOW() - INTERVAL '7 days') as runs_last_7_days,
       (SELECT max(start_time) FROM cron.job_run_details jrd 
        WHERE jrd.jobid = cj.jobid) as last_run
FROM cron.job cj;
```

## Troubleshooting
- If jobs don't run: Check `cron.job_run_details` for errors
- If pg_cron not enabled: Enable in Supabase Dashboard → Database → Extensions
- Timezone issues: Verify `NOW() AT TIME ZONE 'Asia/Kathmandu'` returns correct Nepal time