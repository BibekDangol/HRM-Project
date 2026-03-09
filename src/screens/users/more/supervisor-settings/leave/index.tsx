import LeaveView from "@/src/components/Leave/LeaveView";
import { fetchLeaveBySupervisor } from "@/src/services/leave.service";

export default function SupervisorLeaveScreen() {
  return <LeaveView
    approvedPath="/(users)/more/supervisor-settings/leave/approved-details"
    pendingPath="/(users)/more/supervisor-settings/leave/leave-details"
    rejectedPath="/(users)/more/supervisor-settings/leave/rejected-details"
    fetchLeaves={fetchLeaveBySupervisor} />

}