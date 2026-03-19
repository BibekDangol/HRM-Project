import { Session, User } from "@supabase/supabase-js";

import { create } from "zustand";
import { supabase } from "../supabase/supabaseClient";

type SignUpData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
};
type SignInResult = { error: string } | { role: string; status: string | null };
type ForgotPasswordState = {
  loading: boolean;
  emailSent: boolean;
  error: string | null;
};
type ForgotPasswordResult = { success: true } | { error: string };
type AuthState = {
  user: User | null;
  session: Session | null;
  role: string | null;
  loading: boolean;
  status: string | null;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  updateStatus: (status: "pending" | "active") => void;
  forgotPasswordState: ForgotPasswordState;
  forgotPassword: (email: string) => Promise<ForgotPasswordResult>;
  resetForgotPasswordState: () => void;
};
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: false,
  status: null,
  forgotPasswordState: {
    loading: false,
    emailSent: false,
    error: null,
  },
  signUp: async ({
    email,
    password,
    firstName,
    lastName,
    organizationName,
  }) => {
    set({ loading: true });
    try {
      let { data: orgData, error: orgError } = await supabase
        .from("organization")
        .select("*")
        .eq("name", organizationName)
        .maybeSingle();
      if (orgError) throw orgError;

      let orgId: number;
      if (orgData) {
        orgId = orgData.id;
      } else {
        const { data: newOrg, error: newOrgError } = await supabase
          .from("organization")
          .insert({ name: organizationName })
          .select()
          .single();
        if (newOrgError || !newOrg?.id)
          throw newOrgError || new Error("Failed to create organization");
        orgId = newOrg.id;
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError || !authData?.user)
        throw authError || new Error("Signup failed");
      const userId = authData.user.id;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          organization_id: orgId,
          role: "admin",
          status: "active",
        })
        .select();
      if (profileError) throw profileError;
      console.log(profile[0]);
      set({
        session: authData.session,
        user: authData.user,
        role: profile[0].role,
        status: profile[0].status,
        loading: false,
      });
      set({ loading: false });
    } catch (err: any) {
      console.log("Signup error:", err);
      set({ loading: false });
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
        status: profileData.status,
        loading: false,
      });

      return { role: profileData.role, status: profileData.status };
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
  forgotPassword: async (email: string): Promise<ForgotPasswordResult> => {
    set({
      forgotPasswordState: { loading: true, emailSent: false, error: null },
    });

    try {
      const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: __DEV__
          ? "exp://192.168.40.108:8081/--/resetPassword"
          : "myapp://resetPassword",
      });
      //to seprate server/--/from app.
      console.log("forgot password errr", error);
      console.log("forgot password data", data);

      if (error) {
        set({
          forgotPasswordState: {
            loading: false,
            emailSent: false,
            error: error.message,
          },
        });

        return { error: error.message };
      }

      set({
        forgotPasswordState: {
          loading: false,
          emailSent: true,
          error: null,
        },
      });

      return { success: true };
    } catch (err: any) {
      set({
        forgotPasswordState: {
          loading: false,
          emailSent: false,
          error: err.message,
        },
      });

      return { error: err.message };
    }
  },
  resetForgotPasswordState: () => {
    set({
      forgotPasswordState: { loading: false, emailSent: false, error: null },
    });
  },
  restoreSession: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.getSession();
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
