import { supabase } from "@/src/supabase/supabaseClient";
import { nepalDateYYYYMMDD } from "@/src/utils/getDate";

export type AdminDashboardOverview = {
  pendingLeaves: number;
  working: number;
  completed: number;
  date: string;
};

export async function fetchAdminDashboardOverview(
  organizationId: number,
): Promise<AdminDashboardOverview> {
  const date = nepalDateYYYYMMDD();
  const results = await Promise.all([
    supabase.from("leaves")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "pending"),
    supabase.from("attendance")
      .select("id, profiles!inner(organization_id)", { count: "exact", head: true })
      .eq("profiles.organization_id", organizationId)
      .eq("date", date)
      .eq("status", "incomplete")
      .not("check_in_time", "is", null)
      .is("check_out_time", null),
    supabase.from("attendance")
      .select("id, profiles!inner(organization_id)", { count: "exact", head: true })
      .eq("profiles.organization_id", organizationId)
      .eq("date", date)
      .eq("status", "present"),
  ]);

  for (const result of results) {
    if (result.error) throw result.error;
    if (result.count == null) throw new Error("Dashboard count is unavailable.");
  }

  return {
    pendingLeaves: results[0].count!,
    working: results[1].count!,
    completed: results[2].count!,
    date,
  };
}
