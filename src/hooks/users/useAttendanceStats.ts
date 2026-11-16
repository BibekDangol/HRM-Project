import {
  getNepalMonthDateRangeYYYYMMDD,
  getNepalMonthRangeUTCISO,
  normalize,
} from "@/src/utils/userDashboard";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/src/supabase/supabaseClient";
import { diffDaysInclusive } from "@/src/utils/leaveUtils";

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
      const lastDate = new Date(Date.parse(endDateExclusive) - 86400000)
        .toISOString().slice(0, 10);
      const leaveTaken = leaves.reduce((sum, leave) => {
        const end = leave.end_date ?? leave.start_date;
        const totalDays = diffDaysInclusive(leave.start_date, end) ?? 0;
        if (totalDays <= 0) return sum;
        const overlapDays = Math.max(0, diffDaysInclusive(
          leave.start_date > startDate ? leave.start_date : startDate,
          end < lastDate ? end : lastDate,
        ) ?? 0);
        return sum + overlapDays * ((leave.days_count ?? totalDays) / totalDays);
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
        const rows = byDate ?? [];

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

      const rows = byCreatedAt ?? [];

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start the loading indicator for this external data fetch.
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}
