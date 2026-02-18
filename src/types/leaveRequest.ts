export interface Props {
  visible: boolean;
}

export type LeaveRow = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
  leave_type?: { id: string; name: string } | null;
};