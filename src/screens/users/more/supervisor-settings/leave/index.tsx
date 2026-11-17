import LeaveView from "@/src/components/Leave/AdminLeaveView";
import { fetchLeaveBySupervisor } from "@/src/services/leave.service";

export default function SupervisorLeaveScreen() {
  return (
    <LeaveView
      approvedPath="/(users)/(main-tabs)/more/supervisor-settings/leave/approved-details"
      pendingPath="/(users)/(main-tabs)/more/supervisor-settings/leave/pending-details"
      rejectedPath="/(users)/(main-tabs)/more/supervisor-settings/leave/rejected-details"
      fetchLeaves={fetchLeaveBySupervisor}
    />
  );
}
