// src/services/leave.service.ts

import { apiClient } from "../api/apiClient";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type Leave = {
  id: string;
  user_id: string;
  organization_id: number;
  start_date: string;
  end_date: string;
  leave_type_id: number | null;
  leave_type_name: string;
  leave_limit: number;
  days_count: number;
  status: LeaveStatus;
  reason?: string;
  first_name: string;
  last_name: string;
  action_taken_by: string;
};

// Fetch all leave requests for an organization
export async function fetchLeaveRequests(orgId: number): Promise<Leave[]> {
  const res = await apiClient.post("/fetch-leave-services", {
    action: "fetchLeaveRequests",
    payload: { orgId },
  });
  // If Edge returns { leaves: [...] }
  return res.data?.leaves ?? [];
}

// Fetch a single leave by ID
export async function fetchLeaveById(id: string): Promise<Leave> {
  const res = await apiClient.post("/fetch-leave-services", {
    action: "fetchLeaveById",
    payload: { id },
  });
  return res.data.data;
}

// Update leave status
export async function updateLeaveStatus(
  id: string,
  status: LeaveStatus,
  userId?: string,
) {
  try {
    const res = await apiClient.post("/fetch-leave-services", {
      action: "updateLeaveStatus",
      payload: { id, status, userId },
    });

    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  } catch (err: any) {
    throw new Error(err.message || "Failed to update leave status");
  }
}

// Sum of leave days for a user by leave type (approved + pending)
export async function sumUserLeaveDaysByType(
  userId: string,
  leaveTypeId: number,
): Promise<number> {
  const res = await apiClient.post("/fetch-leave-services", {
    action: "sumUserLeaveDaysByType",
    payload: { userId, leaveTypeId },
  });
  // Edge function should return: { total: number }
  return res.data?.total ?? 0;
}
export async function fetchLeaveBySupervisor(
  orgId: number,
  supervisorId: string,
) {
  const res = await apiClient.post("/fetch-supervisor-leaves", {
    action: "fetchSupervisorLeaves",
    payload: { orgId: orgId, supervisorId: supervisorId },
  });
  return res.data?.leaves ?? [];
}
