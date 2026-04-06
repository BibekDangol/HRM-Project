import {
  Leave,
  LeaveStatus,
  fetchLeaveRequests,
} from "@/src/services/leave.service";
import { useCallback, useEffect, useState } from "react";

import { useUsersStore } from "@/src/store/useUsersStore";

type LeaveType = {
  id: number;
  name: string;
};

export function useLeaves() {
  const { currentUserProfile } = useUsersStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!currentUserProfile) return;
    try {
      setLoading(true);
      const data = await fetchLeaveRequests(currentUserProfile.organization_id);
      setLeaves(data);
      setLeaveTypes([]);
    } catch (err) {
      console.log("Error loading leaves:", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaves();
    setRefreshing(false);
  }, [loadLeaves]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const filteredByStatus = useCallback(
    (status: LeaveStatus) => leaves.filter((l) => l.status === status),
    [leaves],
  );

  return {
    leaves,
    leaveTypes,
    loading,
    refreshing,
    onRefresh,
    filteredByStatus,
  };
}
