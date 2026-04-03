import { apiClient } from "@/src/api/apiClient";
import { fetchUsersService } from "@/src/services/admin.service";

export type AdminAddUserPayload = {
  email: string;
  firstName: string;
  lastName: string;
  orgId: number;
  supervisor_id: string | null;
};

export type AdminAddUserResponse = {
  success: boolean;
  tempPassword?: string;
  error?: string;
};

export const adminAddUserService = async (
  payload: AdminAddUserPayload,
): Promise<AdminAddUserResponse> => {
  try {
    console.log("what payload is sent", payload);
    const response = await apiClient.post("/admin-add-user", payload);
    if (!response.data?.success) {
      throw new Error(response.data?.error || "Failed to create user");
    }

    return response.data;
  } catch (err: any) {
    console.log("Add user error:", err);

    // Axios error handling (important)
    const message =
      err.response?.data?.error ||
      err.message ||
      "Something went wrong while creating user";

    throw new Error(message);
  }
};

export const refreshUsersService = async (orgId: number) => {
  return await fetchUsersService(orgId);
};
