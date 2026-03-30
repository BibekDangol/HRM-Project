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
  const { userProfile } = useUsersStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const data = await fetchLeaveRequests(userProfile.organization_id);
      setLeaves(data);
      setLeaveTypes([]);
    } catch (err) {
      console.log("Error loading leaves:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

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
