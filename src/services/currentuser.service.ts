import { supabase } from "../supabase/supabaseClient";

export type CurrentUserProfile = {
  id: string;
  organization_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string | null;
};
export async function fetchCurrentUserProfleService(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, organization_id, first_name, last_name, email, avatar")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as CurrentUserProfile;
}
