import { useCallback, useEffect, useMemo, useState } from "react";

import { LeaveStatus } from "@/src/services/leave.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { usePagination } from "@/src/hooks/usePagination";
import { useUsersStore } from "@/src/store/useUsersStore";

type Props = {
  fetchLeaves: (orgId: number, userId: string) => Promise<any[]>;
  scrollRef?: React.RefObject<any>;
};

export function useLeaveView({ fetchLeaves, scrollRef }: Props) {
  const { userProfile } = useUsersStore();
  const { user } = useAuthStore();
  const { leaves, setLeaves } = useLeaveStore();

  const [activeTab, setActiveTab] = useState<LeaveStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 fetch leaves
  const loadLeaves = useCallback(async () => {
    if (!userProfile || !user) return;

    try {
      setLoading(true);
      const data = await fetchLeaves(userProfile.organization_id, user.id);
      setLeaves(data);
    } finally {
      setLoading(false);
    }
  }, [userProfile, user, fetchLeaves, setLeaves]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  // 🔥 filter by tab
  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => l.status === activeTab);
  }, [leaves, activeTab]);

  // 🔥 pagination (applied AFTER filtering)
  const {
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pagedData: paginatedLeaves,
    pageNumbers,
  } = usePagination(filteredLeaves);

  // 🔥 counts (all leaves)
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
    setActiveTab,

    loading,
    refreshing,

    // pagination
    page,
    setPage,
    totalPages,
    shouldShowPagination,
    pageNumbers,

    // actions
    loadLeaves,
    onRefresh,
  };
}
