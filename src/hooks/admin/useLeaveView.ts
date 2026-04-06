import { useCallback, useEffect, useMemo, useState } from "react";

import { usePagination } from "@/src/hooks/usePagination";
import { LeaveStatus } from "@/src/services/leave.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useUsersStore } from "@/src/store/useUsersStore";

type Props = {
  fetchLeaves: (orgId: number, userId: string) => Promise<any[]>;
  scrollRef?: React.RefObject<any>;
  activeTab: LeaveStatus;
};

export function useLeaveView({ fetchLeaves, scrollRef, activeTab }: Props) {
  const { currentUserProfile } = useUsersStore();
  const { user } = useAuthStore();
  const { leaves, setLeaves } = useLeaveStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!currentUserProfile || !user) return;

    try {
      setLoading(true);
      const data = await fetchLeaves(currentUserProfile.organization_id, user.id);
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }, [currentUserProfile, user, fetchLeaves, setLeaves]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);

  const {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData: paginatedLeaves,
    pageNumbers,
  } = usePagination(filteredLeaves);

  const counts = useMemo(() => {
    return leaves.reduce(
      (acc, l) => {
        acc[l.status] = (acc[l.status] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 } as Record<string, number>,
    );
  }, [leaves]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLeaves();
    setRefreshing(false);
    setPage(1);
  }, [loadLeaves, setPage]);

  return {
    leaves,
    filteredLeaves,
    paginatedLeaves,
    counts,
    activeTab,
    loading,
    refreshing,

    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pageNumbers,

    loadLeaves,
    onRefresh,
  };
}
