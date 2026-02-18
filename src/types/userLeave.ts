import { z } from "zod";
import { userLeaveSchema } from "../schema/users/userLeaveApply.schema";

export type FormValues = z.input<typeof userLeaveSchema>;

// Base leave type
export type LeaveTypeRow = {
  id: number;
  name: string | null;
  leave_limit: number;
};

// For index screen (allows null leave_limit)
export type LeaveTypeRowIndex = {
  id: number;
  name: string | null;
  leave_limit: number | null;
};

// Leave type with calculated stats
export type LeaveTypeWithStats = LeaveTypeRow & {
  approvedUsed: number;
  pending: number;
  remaining: number;
};

// Generic leave record (for calculations)
export type LeaveRow = {
  leave_type_id: number | string;
  start_date: string;
  end_date: string;
  day_type?: "FULL" | "MORNING" | "EVENING" | string | null;
  days_count?: number | null;
  status?: string | null;
};

// Full leave details (from database)
export type LeaveDetailsRow = {
  id: string;
  user_id: string | null;
  leave_type_id: number | null;
  status: string | null;
  start_date: string;
  end_date: string;
  days_count: number | null;
  day_type: string | null;
};

// Aggregated stats by leave type
export type LeaveTypeStats = {
  leaveTypeId: number;
  name: string;
  limit: number;
  approved: number;
  pending: number;
  rejected: number;
  remaining: number;
};

export type LeaveStatus = "approved" | "pending" | "rejected";