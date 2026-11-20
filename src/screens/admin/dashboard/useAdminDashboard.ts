import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { useAdminCalendar } from "@/src/hooks/admin/useAdminCalendar";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchAdminDashboardOverview, type AdminDashboardOverview } from "@/src/services/admin/dashboard.service";
import { mapAppError } from "@/src/utils/mapAppError";
import type { AddUserFormData } from "../manage-users/AddUserModal";

export function useAdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const { users, currentUserProfile, setUsers } = useUsersStore();
  const {
    calendarItems,
    calendarLoading,
    fetchCalendarItems,
  } = useAdminCalendar();

  const [refreshing, setRefreshing] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [overviewError, setOverviewError] = useState(false);
  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const loadId = useRef(0);

  const organizationId = currentUserProfile?.organization_id;

  const loadAll = useCallback(async () => {
    if (!organizationId) return;
    const requestId = ++loadId.current;
    setOverviewError(false);
    const [userResult, , overviewResult] = await Promise.allSettled([
      fetchUsersService(organizationId),
      fetchCalendarItems(organizationId),
      fetchAdminDashboardOverview(organizationId),
    ]);
    if (requestId !== loadId.current) return;
    if (userResult.status === "fulfilled") {
      setUsers(userResult.value);
      setEmployeeCount(userResult.value.length);
    } else {
      setEmployeeCount(null);
      Alert.alert("Could not load employees", "Pull down to try again.");
    }
    if (overviewResult.status === "fulfilled") setOverview(overviewResult.value);
    else {
      setOverview(null);
      setOverviewError(true);
    }
  }, [organizationId, setUsers, fetchCalendarItems]);

  useFocusEffect(useCallback(() => {
    void loadAll();
    return () => { loadId.current += 1; };
  }, [loadAll]));

  const handleAddUser = async (data: AddUserFormData) => {
    if (!currentUserProfile?.organization_id) {
      return { success: false as const, error: mapAppError({ status: 422, fields: { orgId: "required" } }, { endpoint: "admin-add-user" }) };
    }
    try {
      setIsSubmittingUser(true);
      const res = await adminAddUserService({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: currentUserProfile.organization_id,
        supervisor_id: data.supervisor_id,
      });
      if (!res.success) return res;
      setTempPassword(res.data.tempPassword ?? null);
      if (!res.data.tempPassword) {
        setAddUserModalVisible(false);
        Alert.alert("User created", "No temporary password was returned. Ask the user to reset their password before signing in.");
      }
      void loadAll();
      return res;
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  return {
    users,
    employeeCount,
    currentUserId: user?.id ?? "",
    calendarItems,
    calendarLoading,
    overview,
    overviewError,
    refreshing,
    onRefresh,
    addUserModalVisible,
    openAddUser: () => setAddUserModalVisible(true),
    closeAddUser: () => {
      setTempPassword(null);
      setAddUserModalVisible(false);
    },
    tempPassword,
    isSubmittingUser,
    handleAddUser,
  };
}
