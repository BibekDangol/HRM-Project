import LeaveView from "@/src/components/Leave/AdminLeaveView";
import { fetchLeaveBySupervisor } from "@/src/services/leave.service";

export default function SupervisorLeaveScreen() {
  return (
    <LeaveView
      approvedPath="/(users)/more/supervisor-settings/leave/approved-details"
      pendingPath="/(users)/more/supervisor-settings/leave/pending-details"
      rejectedPath="/(users)/more/supervisor-settings/leave/rejected-details"
      fetchLeaves={fetchLeaveBySupervisor}
    />
  );
}
