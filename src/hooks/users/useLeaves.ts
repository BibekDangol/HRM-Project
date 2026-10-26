import {
  Leave,
  LeaveStatus,
  LeaveType,
  fetchLeaveRequests,
} from "@/src/services/leave.service";
import { fetchLeaveTypesService } from "@/src/services/leave.type.service";
import { useRefreshableQuery } from "@/src/hooks/useRefreshableQuery";
import { useCallback, useMemo } from "react";
import { useUsersStore } from "@/src/store/useUsersStore";

const EMPTY_DATA: { leaves: Leave[]; leaveTypes: LeaveType[] } = {
  leaves: [],
  leaveTypes: [],
};

export function useLeaves() {
  const { currentUserProfile } = useUsersStore();

  const organizationId = currentUserProfile?.organization_id;
  const userId = currentUserProfile?.id;

  const queryFn = useCallback(async () => {
    if (!organizationId || !userId) {
      return EMPTY_DATA;
    }
    const [allLeaves, types] = await Promise.all([
      fetchLeaveRequests(organizationId),
      fetchLeaveTypesService(organizationId),
    ]);
    const userLeaves = (allLeaves ?? []).filter((l) => l.user_id === userId);
    return {
      leaves: userLeaves,
      leaveTypes: (types ?? []) as LeaveType[],
    };
  }, [organizationId, userId]);

  const { data, loading, refreshing, onRefresh } = useRefreshableQuery(
    queryFn,
    [organizationId, userId],
    {
      enabled: Boolean(organizationId && userId),
      initialData: EMPTY_DATA,
    },
  );

  const leaves = useMemo(() => data?.leaves ?? [], [data?.leaves]);
  const leaveTypes = useMemo(() => data?.leaveTypes ?? [], [data?.leaveTypes]);

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

