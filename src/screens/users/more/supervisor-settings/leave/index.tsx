import AdminLeaveView from "@/src/components/Leave/AdminLeaveView";
import { fetchLeaveBySupervisor } from "@/src/services/leave.service";

export default function SupervisorLeaveScreen() {
  return (
    <AdminLeaveView
      approvedPath="/(users)/more/supervisor-settings/leave/approved-details"
      pendingPath="/(users)/more/supervisor-settings/leave/leave-details"
      rejectedPath="/(users)/more/supervisor-settings/leave/rejected-details"
      fetchLeaves={fetchLeaveBySupervisor}
    />
  );
}
