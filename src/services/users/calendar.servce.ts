import { supabase } from "@/src/supabase/supabaseClient";

export async function getCalendarItems(
  orgId: number,
  start: string,
  end: string,
) {
  return supabase
    .from("admin_calendar")
    .select("id, title, type, color, start_date, end_date")
    .eq("organization_id", orgId)
    .lte("start_date", end)
    .or(`end_date.gte.${start},end_date.is.null`)
    .order("start_date");
}
