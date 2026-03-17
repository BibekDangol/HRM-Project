import UserLeaveView from "@/src/components/Leave/UserLeaveView";
import { fetchLeaveBySupervisor } from "@/src/services/leave.service";

export default function SupervisorLeaveScreen() {
  return (
    <UserLeaveView
      approvedPath="/(users)/more/supervisor-settings/leave/approved-details"
      pendingPath="/(users)/more/supervisor-settings/leave/leave-details"
      rejectedPath="/(users)/more/supervisor-settings/leave/rejected-details"
      fetchLeaves={fetchLeaveBySupervisor}
    />
  );
}
