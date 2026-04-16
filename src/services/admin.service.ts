import { UserProfile } from "../types/admin";
import { supabase } from "@/src/supabase/supabaseClient";

function buildPrefix(searchQuery: string) {
  return searchQuery
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/:\*$/g, ""))
    .filter(Boolean)
    .map((word) => `${word}`)
    .join(" & ");
}

export async function fetchUsersService(orgId: number, searchQuery = "") {
  if (searchQuery.trim()) {
    const prefix = buildPrefix(searchQuery);
    console.log("search query", prefix);
    const { data, error } = await supabase.rpc("search_users", {
      prefix,
      org_id: orgId,
    });
    if (error) throw error;
    return data as UserProfile[];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, status, organization_id, supervisor_id, organization(name)",
    )
    .eq("organization_id", orgId);

  if (error) throw error;
  return data as UserProfile[];
}

export async function fetchSupervisorUnderUsersService(
  orgId: number,
  searchQuery = "",
  supervisorId: string,
) {
  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, role, status, organization_id, supervisor_id, organization(name), avatar",
    )
    .eq("organization_id", orgId)
    .eq("supervisor_id", supervisorId)
    .neq("id", supervisorId);

  if (searchQuery.trim()) {
    const q = searchQuery.trim().replace(/\s+/g, " ");
    const parts = q.split(" ").filter(Boolean);

    if (parts.length >= 2) {
      query = query
        .ilike("first_name", `%${parts[0]}%`)
        .ilike("last_name", `%${parts.slice(1).join(" ")}%`);
    } else {
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`
      );
    }
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as UserProfile[];
}