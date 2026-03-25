import { supabase } from "../supabase/supabaseClient";

export const forgotPasswordService = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: __DEV__
      ? "exp://192.168.40.108:8081/--/resetPassword"
      : "myapp://resetPassword",
  });
  if (error) throw new Error(error.message);
  return true;
};
