export type AttendanceRow = {
  check_in_comment: string | null;
  check_in_time: string | null;
  check_out_comment: string | null;
  check_out_time: string | null;
  date?: string; // optional if your select doesn't include it
  id: string;
  status: string | null;
  user_id: string | null;
};
export type AttendanceRules = {
  id: number;
  checkin_start: string | null;
  checkin_end: string | null;
  checkout_start: string | null;
  checkout_end: string | null;
};
export type AttendanceStatsRow = {
  status: "present" | "absent" | "incomplete" | "on_leave";
  check_in_comment: string | null;
  date: string;
};