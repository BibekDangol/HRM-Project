import { apiClient } from "@/src/api/apiClient";
import { fetchUsersService } from "@/src/services/admin.service";

export type AdminAddUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  orgId: number;
  supervisor_id: string;
};

export type AdminAddUserResponse = {
  success: boolean;
  tempPassword?: string;
  error?: string;
};

export const adminAddUserService = async (
  payload: AdminAddUserPayload,
): Promise<AdminAddUserResponse> => {
  const response = await apiClient.post("/admin-add-user", payload);
  if (!response.data?.success) {
    throw new Error(response.data?.error || "Failed to create user");
  }
  return response.data;
};

export const refreshUsersService = async (orgId: number) => {
  return await fetchUsersService(orgId);
};
