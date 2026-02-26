import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/src/supabase/supabaseClient";
import { getMonthKey } from "@/src/utils/getDate";

export type Attendance = {
  id: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string | null;
};

export const useAttendance = (userId: string | undefined) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("id, check_in_time, check_out_time, status")
      .eq("user_id", userId);
    if (!error && data) {
      setAttendance(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [userId]);

  const summary = useMemo(() => {
    return {
      present: attendance.filter((u) => u.status === "present").length,
      leave: attendance.filter((u) => u.status === "on_leave").length,
      absent: attendance.filter((u) => u.status === "absent").length,
    };
  }, [attendance]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        attendance
          .filter((a) => a.check_in_time)
          .map((a) => getMonthKey(a.check_in_time!))
      )
    );
  }, [attendance]);

  const monthData = useMemo(() => {
    if (!selectedMonth) return attendance;

    return attendance.filter(
      (a) =>
        a.check_in_time &&
        getMonthKey(a.check_in_time) === selectedMonth
    );
  }, [attendance, selectedMonth]);

  const groupedByDate = useMemo(() => {
    return monthData.reduce(
      (acc: Record<string, Attendance[]>, att) => {
        if (att.check_in_time) {
          const date = att.check_in_time.split("T")[0];
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
    summary,
    months,
    groupedByDate,
    selectedMonth,
    setSelectedMonth,
    expandedDayId,
    setExpandedDayId,
    loading,
  };
};