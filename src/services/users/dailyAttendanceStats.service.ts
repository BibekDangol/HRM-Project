import { supabase } from "@/src/supabase/supabaseClient";
import { DailyAttendanceStatsRow } from "@/src/types/dailyAttendanceStats";

type StatsRow = {
  id: number;
  organization_id: number;
  stat_date: string;
  total_employees: number;
  present_count: number;
  absent_count: number;
  on_leave_count: number;
  incomplete_count: number;
  leave_days_total: number;
  created_at: string;
  updated_at: string;
};

// Cast supabase to any to bypass strict table name checking for new tables
const supabaseAny = supabase as any;

const getDailyStatsTable = () => supabaseAny.from("daily_attendance_stats");

export const getDailyAttendanceStatsService = async (
  organizationId: number,
  startDate: string,
  endDate: string,
): Promise<DailyAttendanceStatsRow[]> => {
  const { data, error } = await getDailyStatsTable()
    .select("*")
    .eq("organization_id", organizationId)
    .gte("stat_date", startDate)
    .lte("stat_date", endDate)
    .order("stat_date", { ascending: false });

  if (error) throw error;
  return (data as unknown as StatsRow[]).map(mapToDailyAttendanceStatsRow);
};

export const getLatestDailyAttendanceStatsService = async (
  organizationId: number,
  limit = 30,
): Promise<DailyAttendanceStatsRow[]> => {
  const { data, error } = await getDailyStatsTable()
    .select("*")
    .eq("organization_id", organizationId)
    .order("stat_date", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as unknown as StatsRow[]).map(mapToDailyAttendanceStatsRow);
};

export const getDailyAttendanceStatsByDateService = async (
  organizationId: number,
  statDate: string,
): Promise<DailyAttendanceStatsRow | null> => {
  const { data, error } = await getDailyStatsTable()
    .select("*")
    .eq("organization_id", organizationId)
    .eq("stat_date", statDate)
    .maybeSingle();

  if (error) throw error;
  return data ? mapToDailyAttendanceStatsRow(data as unknown as StatsRow) : null;
};

export const getOrganizationDailyAttendanceSummaryService = async (
  organizationId: number,
  year: number,
  month: number,
): Promise<{
  total_employees: number;
  total_present: number;
  total_absent: number;
  total_on_leave: number;
  total_incomplete: number;
  total_leave_days: number;
  days_with_data: number;
}> => {
  const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];

  const { data, error } = await getDailyStatsTable()
    .select("total_employees, present_count, absent_count, on_leave_count, incomplete_count, leave_days_total")
    .eq("organization_id", organizationId)
    .gte("stat_date", startDate)
    .lte("stat_date", endDate);

  if (error) throw error;

  const rows = (data as unknown as Pick<StatsRow, 'total_employees' | 'present_count' | 'absent_count' | 'on_leave_count' | 'incomplete_count' | 'leave_days_total'>[]) ?? [];
  return {
    total_employees: rows.length > 0 ? rows[0].total_employees : 0,
    total_present: rows.reduce((sum, r) => sum + r.present_count, 0),
    total_absent: rows.reduce((sum, r) => sum + r.absent_count, 0),
    total_on_leave: rows.reduce((sum, r) => sum + r.on_leave_count, 0),
    total_incomplete: rows.reduce((sum, r) => sum + r.incomplete_count, 0),
    total_leave_days: rows.reduce((sum, r) => sum + Number(r.leave_days_total), 0),
    days_with_data: rows.length,
  };
};

function mapToDailyAttendanceStatsRow(row: StatsRow): DailyAttendanceStatsRow {
  return {
    id: row.id,
    organization_id: row.organization_id,
    stat_date: row.stat_date,
    total_employees: row.total_employees,
    present_count: row.present_count,
    absent_count: row.absent_count,
    on_leave_count: row.on_leave_count,
    incomplete_count: row.incomplete_count,
    leave_days_total: row.leave_days_total,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}