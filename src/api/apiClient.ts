import { supabase } from "@/src/supabase/supabaseClient";
import { create } from "axios";

export const apiClient = create({
  baseURL: "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    const token = session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
