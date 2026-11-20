import { supabase } from "@/src/supabase/supabaseClient";

export async function fetchCalendarWeekendDays(organizationId: number) {
  const { data, error } = await supabase
    .from("calendar_settings")
    .select("weekend_days")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data?.weekend_days ?? [0, 6];
}

export async function saveCalendarWeekendDays(organizationId: number, days: number[]) {
  if (days.some(day => !Number.isInteger(day) || day < 0 || day > 6)) {
    throw new Error("Select valid weekend days.");
  }
  const weekendDays = [...new Set(days)].sort((a, b) => a - b);
  const { data, error } = await supabase
    .from("calendar_settings")
    .upsert({ organization_id: organizationId, weekend_days: weekendDays })
    .select("weekend_days")
    .single();
  if (error) throw error;
  return data.weekend_days;
}
