import {
  getNepalMonthDateRangeYYYYMMDD,
  getNepalMonthRangeUTCISO,
  normalize,
} from "@/src/utils/userDashboard";
import { useCallback, useEffect, useState } from "react";

import { AttendanceRow } from "@/src/types/user";
import { supabase } from "@/src/supabase/supabaseClient";

type Stats = {
  present: number;
  absent: number;
  leaveTaken: number;
  incomplete: number;
};

type LeaveRow = {
  days_count: number | null;
  start_date: string;
  end_date: string | null;
  status: string | null;
};

export function useAttendanceStats(
  userId?: string,
  year?: number,
  monthIndex?: number,
) {
  const [stats, setStats] = useState<Stats>({
    present: 0,
    absent: 0,
    leaveTaken: 0,
    incomplete: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId || year == null || monthIndex == null) return;

    setLoading(true);

    try {
      const { startDate, endDateExclusive } = getNepalMonthDateRangeYYYYMMDD(
        year,
        monthIndex,
      );

      /**
       * 1. Fetch approved leaves overlapping this month
       */
      const { data: leaveData, error: leaveError } = await supabase
        .from("leaves")
        .select("days_count, start_date, end_date, status")
        .eq("user_id", userId)
        .eq("status", "approved")
        .lt("start_date", endDateExclusive)
        .or(`end_date.gte.${startDate},end_date.is.null`);

      if (leaveError) throw leaveError;

      const leaves = (leaveData ?? []) as LeaveRow[];

      const leaveTaken = leaves.reduce((sum, leave) => {
        return sum + (leave.days_count ?? 0);
      }, 0);

      /**
       * 2. Try using date column (preferred)
       */
      const { data: byDate, error: dateError } = await supabase
        .from("attendance")
        .select("status, check_in_comment, date")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lt("date", endDateExclusive);

      if (!dateError) {
        const rows = (byDate ?? []) as AttendanceRow[];

        const result: Stats = {
          present: rows.filter((r) => normalize(r.status) === "present").length,
          absent: rows.filter((r) => normalize(r.status) === "absent").length,
          incomplete: rows.filter((r) => normalize(r.status) === "incomplete")
            .length,
          leaveTaken,
        };

        setStats(result);
        return;
      }

      /**
       * 3. Fallback: use created_at (UTC-based)
       */
      const { startISO, endISO } = getNepalMonthRangeUTCISO(year, monthIndex);

      const { data: byCreatedAt, error: createdError } = await supabase
        .from("attendance")
        .select("status, check_in_comment, created_at")
        .eq("user_id", userId)
        .gte("created_at", startISO)
        .lt("created_at", endISO);

      if (createdError) throw createdError;

      const rows = (byCreatedAt ?? []) as AttendanceRow[];

      const result: Stats = {
        present: rows.filter((r) => normalize(r.status) === "present").length,
        absent: rows.filter((r) => normalize(r.status) === "absent").length,
        incomplete: rows.filter((r) => normalize(r.status) === "incomplete")
          .length,
        leaveTaken,
      };

      setStats(result);
    } catch (error) {
      console.error("useAttendanceStats error:", error);

      setStats({
        present: 0,
        absent: 0,
        leaveTaken: 0,
        incomplete: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, year, monthIndex]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}
