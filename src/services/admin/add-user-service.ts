import { apiClient } from "@/src/api/apiClient";
import { fetchUsersService } from "@/src/services/admin.service";
import { supabase } from "@/src/supabase/supabaseClient";
import type { AppResult, ErrorContext } from "@/src/types/appError";
import { createRequestId, mapAppError, reportAppError } from "@/src/utils/mapAppError";

export type AdminAddUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  orgId: number;
  supervisor_id: string | null;
};

export type AdminAddUserResponse = AppResult<{ tempPassword?: string }>;

type ApiResponse = {
  success?: boolean;
  tempPassword?: string;
  code?: string;
  fields?: unknown;
};

export const adminAddUserService = async (
  payload: AdminAddUserPayload,
): Promise<AdminAddUserResponse> => {
  let context: ErrorContext = { endpoint: "profile-email-check", requestId: createRequestId() };
  const controller = new AbortController();
  let emailCheckTimedOut = false;
  const timer = setTimeout(() => {
    emailCheckTimedOut = true;
    controller.abort();
  }, 30_000);
  try {
    const { data: existing, error, status } = await supabase
      .from("profiles").select("id").eq("email", payload.email)
      .abortSignal(controller.signal).maybeSingle();
    clearTimeout(timer);
    if (emailCheckTimedOut) throw mapAppError({ code: "ETIMEDOUT" }, context);
    if (error) throw mapAppError({ response: { status, data: error } }, context);
    if (existing) {
      return { success: false, error: mapAppError({ status: 409, fields: { email: "alreadyExists" } }, context) };
    }

    context = { endpoint: "admin-add-user", requestId: createRequestId() };
    const response = await apiClient.post<ApiResponse>("/admin-add-user", payload);
    if (response.data?.success !== true) {
      throw mapAppError({ response: { status: response.status, headers: response.headers, data: response.data } }, context);
    }
    return {
      success: true,
      data: { tempPassword: typeof response.data.tempPassword === "string" ? response.data.tempPassword : undefined },
    };
  } catch (cause: unknown) {
    const error = mapAppError(emailCheckTimedOut ? { code: "ETIMEDOUT" } : cause, context);
    if (error.kind === "server" || error.kind === "unknown") reportAppError(error);
    return { success: false, error };
  } finally {
    clearTimeout(timer);
  }
};

export const refreshUsersService = async (orgId: number) => fetchUsersService(orgId);
