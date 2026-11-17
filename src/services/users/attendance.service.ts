import { AttendanceRow } from "@/src/types/attendance";
import { getUserLocationOrThrow } from "../../utils/locationHelper";
import { nepalDateYYYYMMDD, parseDate } from "../../utils/getDate";
import { supabase } from "@/src/supabase/supabaseClient";

export const fetchLatestAttendanceService = async (): Promise<{
  row: AttendanceRow | null;
  checkedInAt: Date | null;
}> => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) {
    return { row: null, checkedInAt: null };
  }
  const openRow = await getOpenAttendanceService(user.id);
  if (openRow) {
    return { row: openRow, checkedInAt: parseDate(openRow.check_in_time) };
  }

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("check_in_time", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const row = (data as AttendanceRow | null) ?? null;
  const inAt = parseDate(row?.check_in_time);
  const checkedInAt = row?.status === "incomplete" && inAt ? inAt : null;
  return { row, checkedInAt };
};

export const getOpenAttendanceService = async (
  userId: string,
): Promise<AttendanceRow | null> => {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "incomplete")
    .not("check_in_time", "is", null)
    .is("check_out_time", null)
    .order("check_in_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return (data as AttendanceRow | null) ?? null;
};

export const checkInService = async (comment?: string) => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) throw userErr;
  if (!user) throw new Error("Not authenticated.");

  const loc = await getUserLocationOrThrow();
  const date = nepalDateYYYYMMDD();

  const { data: today, error: todayErr } = await supabase
    .from("attendance")
    .select("id,status")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (todayErr) throw todayErr;

  if (today?.status === "present") {
    throw new Error("Already completed today.");
  }

  if (today?.status === "incomplete") {
    throw new Error("Already checked in.");
  }

  const { data, error } = await supabase
    .from("attendance")
    .upsert(
      {
        user_id: user.id,
        date,
        check_in_time: new Date().toISOString(),
        status: "incomplete",
        check_in_comment: comment?.trim() || null,
        check_in_lat: loc.lat,
        check_in_lng: loc.lng,
        check_out_time: null,
      },
      { onConflict: "user_id,date" },
    )
    .select("*")
    .single();

  if (error) throw error;

  return data as AttendanceRow;
};

export const checkOutService = async (comment?: string) => {
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr) throw userErr;
  if (!user) throw new Error("Not authenticated.");

  const loc = await getUserLocationOrThrow();

  const openRow = await getOpenAttendanceService(user.id);

  if (!openRow) {
    throw new Error("No active check-in.");
  }

  const { data, error } = await supabase
    .from("attendance")
    .update({
      check_out_time: new Date().toISOString(),
      status: "present",
      check_out_comment: comment?.trim() || null,
      check_out_lat: loc.lat,
      check_out_lng: loc.lng,
    })
    .eq("id", openRow.id)
    .eq("status", "incomplete")
    .is("check_out_time", null)
    .select("*")
    .single();

  if (error) throw error;

  return data as AttendanceRow;
};

export const getAttendanceRulesService = async () => {
  const { data, error } = await supabase
    .from("attendance_rules")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    throw new Error("Attendance rules not configured.");
  }
  return data;
};
