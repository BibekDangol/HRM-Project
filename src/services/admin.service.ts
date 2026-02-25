import { supabase } from "@/src/supabase/supabaseClient";
import { UserProfile } from "../types/admin";

export type AdminProfile = {
  id: string;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
};
export async function fetchAdminProfileService(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, organization_id, first_name, last_name, email")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as AdminProfile;
}

export async function fetchUsersService(orgId: number, searchQuery = "") {
  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, status, organization_id, supervisor_id, organization(name)",
    )
    .eq("organization_id", orgId);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().replace(/\s+/g, " ");
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;

  return data as UserProfile[];
}
