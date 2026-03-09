import LeaveView from "@/src/components/Leave/LeaveView";
import { fetchLeaveRequests } from "@/src/services/leave.service";

export default function AdminLeaveScreen() {
  return (
    <LeaveView
      approvedPath="/(admin)/leave/approved-details"
      pendingPath="/(admin)/leave/leave-details"
      rejectedPath="/(admin)/leave/rejected-details"
      fetchLeaves={fetchLeaveRequests}
    />
  )
}