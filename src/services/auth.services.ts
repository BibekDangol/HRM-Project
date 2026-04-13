import { supabase } from "../supabase/supabaseClient";

type SignUpPayload = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw new Error("Incorrect Email or Password");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to fetch user profile");
  }

  return {
    session: data.session,
    user: data.user,
    role: profile.role,
    status: profile.status,
  };
};

export const signUp = async (payload: SignUpPayload) => {
  const { email, password, firstName, lastName, organizationName } = payload;

  const { data: orgData, error: orgFetchError } = await supabase
    .from("organization")
    .select("*")
    .eq("name", organizationName)
    .maybeSingle();

  if (orgFetchError) {
    throw new Error("Failed to check organization");
  }

  let orgId = orgData?.id;

  if (!orgId) {
    const { data: newOrg, error: newOrgError } = await supabase
      .from("organization")
      .insert({ name: organizationName })
      .select()
      .single();

    if (newOrgError || !newOrg) {
      throw new Error("Failed to create organization");
    }

    orgId = newOrg.id;
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Signup failed");
  }

  const { data: profile, error: profileError } = await supabase
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
    .select("role, status")
    .single();

  if (profileError || !profile) {
    throw new Error("Failed to create user profile");
  }

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

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.session.user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error("Failed to fetch session profile");
  }

  return {
    session: data.session,
    user: data.session.user,
    role: profile?.role ?? "user",
  };
};
