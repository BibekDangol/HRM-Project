import { Session, User } from "@supabase/supabase-js";
import {
  getSessionWithProfile,
  signIn,
  signOut,
  signUp,
} from "../services/auth.services";

import { create } from "zustand";
import { forgotPasswordService } from "../services/password.services";

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
  signUp: async (payload) => {
    set({ loading: true });
    try {
      const data = await signUp(payload);
      set({
        session: data.session,
        user: data.user,
        role: data.role,
        status: data.status,
        loading: false,
      });
    } catch (err: any) {
      console.log("signup error:", err.message);
      set({ loading: false });
      throw err;
    }
  },
  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const data = await signIn(email, password);
      set({
        session: data.session,
        user: data.user,
        role: data.role,
        status: data.status,
        loading: false,
      });
      return { role: data.role, status: data.status };
    } catch (err: any) {
      set({ loading: false });
      return { error: err.message };
    }
  },
  updateStatus: (status) => set({ status }),
  signOut: async () => {
    try {
      await signOut();
    } catch (err) {
      console.log("SignOut error:", err);
    } finally {
      set({ user: null, session: null, role: null, loading: false });
    }
  },
  forgotPassword: async (email): Promise<ForgotPasswordResult> => {
    set({
      forgotPasswordState: { loading: true, emailSent: false, error: null },
    });
    try {
      await forgotPasswordService(email);
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

      const data = await getSessionWithProfile();

      if (!data) {
        set({ session: null, user: null, role: null, loading: false });
        return;
      }

      set({
        session: data.session,
        user: data.user,
        role: data.role,
        loading: false,
      });
    } catch (err) {
      console.log("Restore session error:", err);
      set({ session: null, user: null, role: null, loading: false });
    }
  },
}));
