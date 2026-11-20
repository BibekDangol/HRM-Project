import { colors } from "@/theme/colors";
import { supabase } from "@/src/supabase/supabaseClient";
import { useUsersStore } from "@/src/store/useUsersStore";
import type { CalendarItem } from "@/src/types/Calendar";
import { calendarStore } from "@/src/utils/adminCalendar";

type SaveRangeParams = {
  rangeStart: string | null;
  rangeEnd: string | null;
  type: "holiday" | "event";
  label: string;
  color?: string;
};

export default function useAdminCalendarActions() {
  const saveRange = async ({ rangeStart, rangeEnd, type, label, color }: SaveRangeParams) => {
    if (!rangeStart || !label.trim()) throw new Error("Choose dates and enter a title before saving.");
    const end = rangeEnd ?? rangeStart;
    if (end < rangeStart) throw new Error("The end date must be on or after the start date.");

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Your session has expired. Sign in again to save this calendar item.");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();
    if (profileError || !profile) throw new Error("Could not load your organization. Please try saving again.");

    const { data, error } = await supabase.from("admin_calendar")
      .insert({
        user_id: user.id,
        organization_id: profile.organization_id,
        start_date: rangeStart,
        end_date: end,
        title: label.trim(),
        type,
        color: color ?? (type === "holiday" ? colors.danger : colors.primary),
      })
      .select("id, title, type, color, start_date, end_date")
      .single();
    if (error) throw new Error("Could not save this calendar item. Your changes are still here. Try again.");

    if (useUsersStore.getState().currentUserProfile?.organization_id === profile.organization_id) {
      calendarStore.setOrganization(profile.organization_id);
      calendarStore.addCalendarItem(data as CalendarItem);
    }
  };

  return { saveRange };
}
