import { supabase } from "@/src/supabase/supabaseClient";
import { FormOutput } from "@/src/types/user";
import { ProfileData } from "../types/profile.types";

export async function fetchProfileService(
  userId: string,
): Promise<ProfileData> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, avatar, email, organization_id, organization(name), role",
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as unknown as ProfileData;
}

export async function updateProfileService(
  userId: string,
  organizationId: number | null | undefined,
  values: FormOutput,
) {
  const { error: pErr } = await supabase
    .from("profiles")
    .update({
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
    })
    .eq("id", userId);

  if (pErr) throw pErr;

  if (organizationId && values.orgName.trim()) {
    const { error: oErr } = await supabase
      .from("organization")
      .update({ name: values.orgName.trim() })
      .eq("id", organizationId);

    if (oErr) throw oErr;
  }
}

export async function updateAvatarService(userId: string, url: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar: url } as never)
    .eq("id", userId);

  if (error) throw error;
}

export async function removeAvatarService(userId: string) {
  const { error } = await supabase
    .from("profiles")
    .update({ avatar: null } as never)
    .eq("id", userId);

  if (error) throw error;
}
