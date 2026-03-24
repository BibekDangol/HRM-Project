import axios from "axios";
import { useAuthStore } from "@/src/store/useAuthStore";

export const apiClient = axios.create({
  baseURL: "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

//to attach token on every request we use this-> extender of axios
apiClient.interceptors.request.use(
  (config) => {
    const session = useAuthStore.getState().session;
    const token = session?.access_token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
