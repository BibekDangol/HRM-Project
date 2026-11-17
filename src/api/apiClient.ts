import { supabase } from "@/src/supabase/supabaseClient";
import { create } from "axios";
import { createRequestId, getErrorEndpoint, mapAppError } from "@/src/utils/mapAppError";
import type { ErrorContext } from "@/src/types/appError";

declare module "axios" {
  interface AxiosRequestConfig {
    appErrorContext?: ErrorContext;
  }
}

export const apiClient = create({
  baseURL: "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1",
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const context = { endpoint: getErrorEndpoint(config.url), requestId: createRequestId() };
    // Local metadata avoids adding headers that existing web CORS policies may reject.
    config.appErrorContext = context;
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session?.access_token) throw mapAppError({ status: 401 }, context);
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    } catch (error) {
      throw mapAppError(error, context);
    }
  },
);

apiClient.interceptors.response.use(
  response => response,
  (error: unknown) => Promise.reject(mapAppError(error)),
);
