import AdminLeaveView from "@/src/components/Leave/AdminLeaveView";
import { fetchLeaveRequests } from "@/src/services/leave.service";

export default function AdminLeaveScreen() {
  return (
    <AdminLeaveView
      approvedPath="/(admin)/leave/approved-details"
      pendingPath="/(admin)/leave/leave-details"
      rejectedPath="/(admin)/leave/rejected-details"
      fetchLeaves={fetchLeaveRequests}
    />
  );
}
