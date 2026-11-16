import AdminLeaveView from "@/src/components/Leave/AdminLeaveView";
import { fetchLeaveRequests } from "@/src/services/leave.service";
import { useLeaveTabStore } from "@/src/store/useLeaveTabStore";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

export default function AdminLeaveScreen() {
  const reset = useLeaveTabStore((s) => s.reset);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  return (
    <AdminLeaveView
      approvedPath="/(admin)/leave/approved-details"
      pendingPath="/(admin)/leave/pending-details"
      rejectedPath="/(admin)/leave/rejected-details"
      fetchLeaves={fetchLeaveRequests}
    />
  );
}
