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
  late: number;
  incomplete: number;
};

export function useAttendanceStats(
  userId?: string,
  year?: number,
  monthIndex?: number,
) {
  const [stats, setStats] = useState<Stats>({
    present: 0,
    absent: 0,
    late: 0,
    incomplete: 0,
  });

  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId || year == null || monthIndex == null) return;

    setLoading(true);

    try {
      /**
       * 1. Try using date column (preferred)
       */
      const { startDate, endDateExclusive } = getNepalMonthDateRangeYYYYMMDD(
        year,
        monthIndex,
      );

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
          late: rows.filter((r) => normalize(r.check_in_comment) !== "").length,
        };

        setStats(result);
        return;
      }

      /**
       * 2. Fallback: use created_at (UTC-based)
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
        late: rows.filter((r) => normalize(r.check_in_comment) !== "").length,
      };

      setStats(result);
    } catch (error) {
      console.error("useAttendanceStats error:", error);

      setStats({
        present: 0,
        absent: 0,
        late: 0,
        incomplete: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [userId, year, monthIndex]);

  /**
   * Auto-fetch when dependencies change
   */
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    fetchStats,
  };
}
