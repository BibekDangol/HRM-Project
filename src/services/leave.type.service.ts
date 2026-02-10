import { apiClient } from "../api/apiClient";

export async function fetchLeaveTypesService(orgId: number) {
  try {
    const response = await apiClient.post("/get-leave-type", { orgId });
    // Edge function returns { leaveTypes: [...] }
    return response.data.leaveTypes;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Failed to fetch leave types");
  }
}
