import { supabase } from "../supabase/supabaseClient";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.functions.invoke("login", {
    body: { email, password },
  });
  if (error) {
    throw new Error(error.message);
  }
  if (!data.success) {
    throw new Error(data.error);
  }
  await supabase.auth.setSession(data.session);
  return data;
};
export const signUp = async (payload: any) => {
  const { email, password, firstName, lastName, organizationName } = payload;
  let { data: orgData } = await supabase
    .from("organization")
    .select("*")
    .eq("name", organizationName)
    .maybeSingle();
  let orgId = orgData?.id;
  if (!orgId) {
    const { data: newOrg } = await supabase
      .from("organization")
      .insert({ name: organizationName })
      .select()
      .single();
    orgId = newOrg.id;
  }
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError || !authData.user) {
    throw new Error(authError?.message || "Signup failed");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .insert({
      id: authData.user.id,
      email,
      first_name: firstName,
      last_name: lastName,
      organization_id: orgId,
      role: "admin",
      status: "active",
    })
    .select()
    .single();
  return {
    session: authData.session,
    user: authData.user,
    role: profile.role,
    status: profile.status,
  };
};
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};
export const getSessionWithProfile = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .maybeSingle();

  return {
    session: data.session,
    user: data.session.user,
    role: profile?.role ?? "user",
  };
};
