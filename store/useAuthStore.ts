import { Session, User } from "@supabase/supabase-js";

import { create } from "zustand";
import { supabase } from "../supabase/supabaseClient";

// Input type for signup
type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
};
type AdminData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  orgId: number;
};

type SignInResult = { error: string } | { role: string; status: string | null; };
type AdminCreateUserResult = { success: boolean; userId: string };
//function returns {success:boolean and string userId} so we must define its return type;
// Auth state type
type AuthState = {
  user: User | null;
  session: Session | null;
  role: string | null; // "admin" or "user"
  loading: boolean;
  status:string | null,

  signUp: (data: SignUpData) => Promise<void>;
  adminCreateUser: (data: AdminData) => Promise<AdminCreateUserResult>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateStatus: (status: "pending" | "active") => void; // <- helper
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: false,
  status:null,
  //initially null rakhdine ani pachi login function call gare pachi set garne status,role haru

  signUp: async ({
    email,
    password,
    firstName,
    lastName,
    organizationName,
  }) => {
    set({ loading: true });

    try {
      // 1️⃣ Check if organization exists
      //Find and create organization.
      let { data: orgData, error: orgError } = await supabase
        .from("organization") // make sure your table is plural
        .select("*")
        .eq("name", organizationName)
        .maybeSingle();
      if (orgError) throw orgError;

      let orgId: number;
      if (orgData) {
        // org exists
        orgId = orgData.id;
      } else {
        // create new organization
        const { data: newOrg, error: newOrgError } = await supabase
          .from("organization")
          .insert({ name: organizationName })
          .select()
          .single();
        if (newOrgError || !newOrg?.id)
          throw newOrgError || new Error("Failed to create organization");
        orgId = newOrg.id;
      }

      // 2️⃣ Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError || !authData?.user)
        throw authError || new Error("Signup failed");

      const userId = authData.user.id;

      // 4️⃣ Insert profile
      const { data:profile, error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email:email,
        first_name: firstName,
        last_name: lastName,
        organization_id: orgId,
        role: "user",
      }).select();
      // insert and select from profile together
      if (profileError) throw profileError;
      set({
        session: authData.session,
        user: authData.user,
        role: profile[0].role,
        loading: false,
      });
      set({ loading: false });
    } catch (err: any) {
      console.log("Signup error:", err);
      set({ loading: false });
      throw err;
    }
  },
  adminCreateUser: async (data: AdminData) => {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          user_metadata: { firstName: data.firstName, lastName: data.lastName },
          email_confirm: true, //optional: auto-confirm email
        });
      if (authError || !authData.user)
        throw authError || new Error("User creation failed");
      const userId = authData.user.id;
      //Insert profile row
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        organization_id: data.orgId,
        role: "user",
      });
      if (profileError) throw profileError;
      return { success: true, userId };
    } catch (err: any) {
      console.log("Admin create user error", err);
      throw err;
    }
  },

  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user)
        return { error: error?.message || "Login failed" };

      const userId = data.user.id;

      // fetch profile to get role
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", userId)
        .maybeSingle();
      if (profileError || !profileData) {
        return { error: "Failed to fetch user role" };
      }
      set({
        session: data.session,
        user: data.user,
        role: profileData?.role,
        status:profileData.status,
        loading: false,
      });

      return { role: profileData.role, status: profileData.status};
      // return the value of signin
      //State updates are async. You can’t rely on them immediately after calling an async function.
      //Zustand ≠ synchronous return value
      //You must use the return value of signIn, not the store state.
    } catch (err: any) {
      console.log("Login error:", err);
      return { error: err.message };
    }
  },
updateStatus: (status) => set({ status }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.log("SignOut error:", err);
    } finally {
      set({ user: null, session: null, role: null, loading: false });
    }
  },

  restoreSession: async () => {
    try {
      set({ loading: true });

      const { data, error } = await supabase.auth.getSession();
      console.log(data);
      if (error || !data.session) {
        set({ session: null, user: null, role: "user", loading: false });
        return;
      }

      const userId = data.session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) console.log("Profile fetch failed:", profileError);

      set({
        session: data.session,
        user: data.session.user,
        role: profile?.role ?? "user",
        loading: false,
      });
    } catch (err) {
      console.log("Restore session error:", err);
      set({ session: null, user: null, role: "user", loading: false });
    }
  },
}));
