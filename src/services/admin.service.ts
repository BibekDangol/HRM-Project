import { UserProfile } from "../types/admin";
import { supabase } from "@/src/supabase/supabaseClient";

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

export async function fetchSupervisorUnderUsersService(orgId:number, searchQuery="", supervisorId: string,){
  console.log("supervisorID", supervisorId)
  let query= supabase.from("profiles").select("id, first_name, last_name, email, role, status, organization_id, supervisor_id, organization(name)")
  .eq("organization_id", orgId).eq("supervisor_id", supervisorId).neq("id",supervisorId);
  if (searchQuery.trim()) {
    const q = searchQuery.trim().replace(/\s+/g, " ");
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
    );
  }
  const {data, error}= await query;
  if (error) throw error;
   console.log(data);
return data as UserProfile[];
}