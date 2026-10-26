import { useCallback, useEffect, useState } from "react";

import { CalendarItem } from "@/src/types/Calendar";
import { supabase } from "@/src/supabase/supabaseClient";

export function useCalendar(
  orgId?: number,
  year?: number,
  monthIndex?: number,
) {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = useCallback(async () => {
    if (orgId == null || year == null || monthIndex == null) return;
    setLoading(true);

    try {
      const monthStr = String(monthIndex + 1).padStart(2, "0");
      const monthStart = `${year}-${monthStr}-01`;
      const monthEnd = `${year}-${monthStr}-${String(
        new Date(year, monthIndex + 1, 0).getDate(),
      ).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("admin_calendar")
        .select("id, title, type, color, start_date, end_date")
        .eq("organization_id", orgId)
        .lte("start_date", monthEnd)
        .or(`end_date.gte.${monthStart},end_date.is.null`)
        .order("start_date", { ascending: true });

      if (error) throw error;

      setItems((data ?? []) as CalendarItem[]);
    } catch (error) {
      console.error("useCalendar error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, year, monthIndex]);

  /**
   * Auto-fetch when dependencies change — uses Promise.then to avoid
   * triggering the react-hooks/set-state-in-effect lint rule.
   */
  useEffect(() => {
    if (orgId == null || year == null || monthIndex == null) return;

    let cancelled = false;

    const monthStr = String(monthIndex + 1).padStart(2, "0");
    const monthStart = `${year}-${monthStr}-01`;
    const monthEnd = `${year}-${monthStr}-${String(
      new Date(year, monthIndex + 1, 0).getDate(),
    ).padStart(2, "0")}`;

    supabase
      .from("admin_calendar")
      .select("id, title, type, color, start_date, end_date")
      .eq("organization_id", orgId)
      .lte("start_date", monthEnd)
      .or(`end_date.gte.${monthStart},end_date.is.null`)
      .order("start_date", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("useCalendar error:", error);
          setItems([]);
        } else {
          setItems((data ?? []) as CalendarItem[]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [orgId, year, monthIndex]);

  return {
    items,
    loading,
    fetch: fetchCalendar,
  };
}
