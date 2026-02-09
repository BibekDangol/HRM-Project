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
