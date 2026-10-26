import { supabase } from "@/src/supabase/supabaseClient";
import { calendarStore } from "@/src/utils/adminCalendar";
import { formatDateKey } from "@/src/utils/getDate";

type SaveRangeParams = {
  rangeStart: string | null;
  rangeEnd: string | null;
  type: "holiday" | "event";
  label: string;
  color?: string;
};

export default function useAdminCalendarActions() {
  const saveRange = async ({
    rangeStart,
    rangeEnd,
    type,
    label,
    color,
  }: SaveRangeParams) => {
    if (!rangeStart) return;

    const start = rangeStart;
    const end = rangeEnd ?? rangeStart;

    let cursor = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");

    while (cursor <= endDate) {
      const key = formatDateKey(cursor);

      if (type === "holiday") {
        calendarStore.setHoliday(key, label);
      } else {
        calendarStore.addEvent(key, label, color ?? "#3B82F6");
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      await supabase.from("admin_calendar").insert([
        {
          user_id: user.id,
          organization_id: profile.organization_id,
          start_date: start,
          end_date: end,
          title: label,
          type,
          color: color ?? "#EF4444",
        },
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  return { saveRange };
}
