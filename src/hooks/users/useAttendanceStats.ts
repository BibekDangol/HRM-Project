import { getNepalMonthDateRangeYYYYMMDD } from "@/src/utils/userDashboard";
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";
import { supabase } from "@/src/supabase/supabaseClient";

type Stats = { present: number; absent: number; leaveTaken: number; incomplete: number };
const EMPTY_STATS: Stats = { present: 0, absent: 0, leaveTaken: 0, incomplete: 0 };

export function useAttendanceStats(userId?: string, year?: number, monthIndex?: number) {
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const fetchStats = useCallback(async () => {
    if (!userId || year == null || monthIndex == null) return;
    const id = ++requestId.current;
    setLoading(true);
    try {
      const { startDate, endDateExclusive } = getNepalMonthDateRangeYYYYMMDD(year, monthIndex);
      const lastDate = new Date(Date.parse(endDateExclusive) - 86400000).toISOString().slice(0, 10);
      const { data, error } = await supabase.rpc("get_user_attendance_summary", {
        p_user_id: userId, p_start_date: startDate, p_end_date: lastDate,
      });
      if (error) throw error;
      if (id !== requestId.current) return;
      const row = data?.[0];
      if (!row) throw new Error("Attendance summary is unavailable.");
      setStats({ present: row.present, absent: row.absent, incomplete: row.incomplete, leaveTaken: row.leave_taken });
    } catch (error) {
      console.error("useAttendanceStats error:", error);
      if (id === requestId.current) setStats(EMPTY_STATS);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [userId, year, monthIndex]);

  useFocusEffect(useCallback(() => {
    void fetchStats();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void fetchStats();
    });
    return () => {
      requestId.current += 1;
      subscription.remove();
    };
  }, [fetchStats]));

  return { stats, loading, fetchStats };
}
