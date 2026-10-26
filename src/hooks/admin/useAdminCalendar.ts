import { useCallback, useState } from "react";

import { CalendarItem } from "@/src/types/Calendar";
import { supabase } from "@/src/supabase/supabaseClient";
import { Alert } from "react-native";

export function useAdminCalendar() {
  const now = new Date();

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const fetchCalendarItems = useCallback(
    async (orgId: string | number) => {
      setCalendarLoading(true);

      try {
        const monthStr = String(selectedMonthIndex + 1).padStart(2, "0");
        const monthStart = `${selectedYear}-${monthStr}-01`;
        const monthEnd = `${selectedYear}-${monthStr}-${String(
          new Date(selectedYear, selectedMonthIndex + 1, 0).getDate(),
        ).padStart(2, "0")}`;

        const { data, error } = await supabase
          .from("admin_calendar")
          .select("id, title, type, color, start_date, end_date")
          .eq("organization_id", Number(orgId))
          .lte("start_date", monthEnd)
          .or(`end_date.gte.${monthStart},end_date.is.null`)
          .order("start_date", { ascending: true });

        if (error) throw error;

        setCalendarItems((data ?? []) as CalendarItem[]);
      } catch {
        Alert.alert("Error", "Failed to load calendar items.");
      } finally {
        setCalendarLoading(false);
      }
    },
    [selectedMonthIndex, selectedYear, setCalendarLoading, setCalendarItems],
  );

  return {
    calendarItems,
    calendarLoading,
    selectedMonthIndex,
    selectedYear,
    setSelectedMonthIndex,
    setSelectedYear,
    fetchCalendarItems,
  };
}
