// src/services/leave.service.ts

import { apiClient } from "../api/apiClient";
import { supabase } from "../supabase/supabaseClient";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveType = {
  id: number;
  leave_limit: number;
  name: string;
};

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
  day_type: string;
  action_taken_by_name: string;
  leave_types: LeaveType;
  leave_duration: number;
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
export async function fetchUserLeavesByYear(
  userId: string,
  from: string,
  to: string,
) {
  const { data, error } = await supabase
    .from("leaves")
    .select("leave_type_id,start_date,end_date,day_type,days_count,status")
    .eq("user_id", userId)
    .gte("start_date", from)
    .lte("start_date", to);

  if (error) throw error;
  return data ?? [];
}
export async function updateLeaveService(payload: any) {
  const { error } = await supabase
    .from("leaves")
    .update(payload.data)
    .eq("id", payload.leaveId)
    .eq("user_id", payload.userId);

  if (error) throw error;
}
