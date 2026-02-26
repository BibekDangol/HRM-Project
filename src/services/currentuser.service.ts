import { supabase } from "../supabase/supabaseClient";

export type userProfile = {
  id: string;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
};
export async function fetchCurrentUserProfleService(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, organization_id, first_name, last_name, email")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as userProfile;
}
