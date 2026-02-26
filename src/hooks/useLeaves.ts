import { Leave, LeaveStatus, fetchLeaveRequests } from "@/src/services/leave.service";
import { useCallback, useEffect, useState } from "react";

import { useUsersStore } from "@/src/store/useUsersStore";

export function useLeaves() {
  const { userProfile } = useUsersStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!userProfile) return;
    try {
      setLoading(true);
      const data = await fetchLeaveRequests(userProfile.organization_id);
      setLeaves(data);
    } catch (err) {
      console.log("Error fetching leaves:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaves();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const filteredByStatus = (status: LeaveStatus) =>
    leaves.filter((l) => l.status === status);
console.log("leaves from useleaves hook>>",leaves, filteredByStatus);
  return { leaves, loading, refreshing, onRefresh, filteredByStatus };
}