import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState } from "react-native";

import { supabase } from "@/src/supabase/supabaseClient";
import { nepalDateYYYYMMDD } from "@/src/utils/getDate";

export type Attendance = {
  id: string;
  date: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string | null;
};

export const useAttendance = (userId: string | undefined) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  const fetchAttendance = useCallback(async () => {
    if (!userId) return;
    const id = ++requestId.current;
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("id, date, check_in_time, check_out_time, status")
      .eq("user_id", userId);
    if (id !== requestId.current) return;
    if (!error && data) {
      setAttendance(data);
    }
    setLoading(false);
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void fetchAttendance();
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") void fetchAttendance();
    });
    return () => {
      requestId.current += 1;
      subscription.remove();
    };
  }, [fetchAttendance]));

  const months = useMemo(() => {
    return Array.from(
      new Set(
        attendance
          .map((a) => a.date ?? (a.check_in_time ? nepalDateYYYYMMDD(new Date(a.check_in_time)) : null))
          .filter((date): date is string => date != null)
          .map(date => date.slice(0, 7))
      )
    );
  }, [attendance]);

  const monthData = useMemo(() => {
    if (!selectedMonth) return attendance;

    return attendance.filter(
      (a) => (a.date ?? (a.check_in_time ? nepalDateYYYYMMDD(new Date(a.check_in_time)) : "")).startsWith(selectedMonth)
    );
  }, [attendance, selectedMonth]);

  const groupedByDate = useMemo(() => {
    return monthData.reduce(
      (acc: Record<string, Attendance[]>, att) => {
        const date = att.date ?? (att.check_in_time ? nepalDateYYYYMMDD(new Date(att.check_in_time)) : null);
        if (date) {
          if (!acc[date]) acc[date] = [];
          acc[date].push(att);
        }
        return acc;
      },
      {}
    );
  }, [monthData]);

  return {
    attendance,
    months,
    groupedByDate,
    selectedMonth,
    setSelectedMonth,
    expandedDayId,
    setExpandedDayId,
    loading,
  };
};
