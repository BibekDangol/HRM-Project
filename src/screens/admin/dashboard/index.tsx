import { mapAppError } from "@/src/utils/mapAppError";
import { colors } from "@/theme/colors";
import { HomeScreenHeader } from "@/src/components/navigation/header/AppHeader";
import AddUserModal, { AddUserFormData } from "../manage-users/AddUserModal";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useRef, useState } from "react";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import QuickActionGrid from "@/src/components/ui/QuickActionGrid";
import MetricCard from "@/src/components/ui/MetricCard";
import { CalendarPlus, Clock, FileText, User, UserPlus } from "lucide-react-native";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import { fetchUsersService } from "@/src/services/admin.service";
import tw from "@/theme/tw";
import { useAdminCalendar } from "@/src/hooks/admin/useAdminCalendar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useFocusEffect, useRouter } from "expo-router";
import AdminOverview from "./AdminOverview";
import { fetchAdminDashboardOverview, type AdminDashboardOverview } from "@/src/services/admin/dashboard.service";
import { useUsersStore } from "@/src/store/useUsersStore";

export default function DashboardScreen() {
  const router = useRouter();
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
  const totalusers = users.length;
  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [overviewError, setOverviewError] = useState(false);
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
    if (userResult.status === "fulfilled") setUsers(userResult.value);
    else Alert.alert("Could not load employees", "Pull down to try again.");
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
    await loadAll();
    setRefreshing(false);
  };

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pb-10`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={{ marginHorizontal: -16, marginBottom: 16 }}>
          <HomeScreenHeader />
        </View>
        <AdminOverview
          overview={overview}
          error={overviewError}
          onReviewLeaves={() => router.push("/(admin)/(main-tabs)/leave")}
          onViewAttendance={() => router.push("/(admin)/(main-tabs)/more/attendance-list")}
        />
        <MetricCard
          title="Total employees"
          sectionTitle="Team overview"
          statusLabel="Directory"
          statusMeta="Refresh to update"
          value={totalusers}
          icon={<User size={24} color={colors.surface} />}
        />

        <QuickActionGrid
          items={[
            {
              label: "Add Employee",
              icon: <UserPlus size={24} color={colors.primary} />,
              onPress: () => setAddUserModalVisible(true),
            },
            {
              label: "Manage Leave",
              icon: <CalendarPlus size={24} color={colors.primary} />,
              onPress: () => router.replace("/(admin)/(main-tabs)/leave"),
            },
            {
              label: "Attendance",
              icon: <Clock size={24} color={colors.primary} />,
              onPress: () => router.replace("/(admin)/(main-tabs)/more/attendance-list"),
            },
            {
              label: "Holidays",
              icon: <FileText size={24} color={colors.primary} />,
              onPress: () => router.replace("/(admin)/(main-tabs)/more/holidays"),
            },
          ]}
        />
        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          onViewAll={() => router.push("/(admin)/holidays")}
        />
      </ScrollView>

      <AddUserModal
        visible={addUserModalVisible}
        tempPassword={tempPassword}
        onClose={() => {
          setTempPassword(null);
          setAddUserModalVisible(false);
        }}
        onSubmit={handleAddUser}
        supervisors={users}
        currentUserId={user?.id ?? ""}
        isSubmitting={isSubmittingUser}
      />
    </View>
  );
}
