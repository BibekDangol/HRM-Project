export type DailyAttendanceStatsRow = {
  id: number;
  organization_id: number;
  stat_date: string; // ISO date string
  total_employees: number;
  present_count: number;
  absent_count: number;
  on_leave_count: number;
  incomplete_count: number;
  leave_days_total: number;
  created_at: string;
  updated_at: string;
  organization_name?: string; // from view join
};

export type DailyAttendanceStatsInsert = Omit<DailyAttendanceStatsRow, 'id' | 'created_at' | 'updated_at' | 'organization_name'>;

export type DailyAttendanceStatsUpdate = Partial<DailyAttendanceStatsInsert>;