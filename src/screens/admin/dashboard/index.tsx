import { colors } from "@/theme/colors";
import AddUserModal, { AddUserFormData } from "../manage-users/AddUserModal";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useRef, useState } from "react";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import QuickActionGrid from "@/src/components/ui/QuickActionGrid";
import MetricCard from "@/src/components/ui/MetricCard";
import TempPasswordModal from "../manage-users/TempPasswordModal";
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
  const { session, user } = useAuthStore();
  const token = session?.access_token;
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
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState(false);
  const loadId = useRef(0);

  const organizationId = currentUserProfile?.organization_id;

  const loadAll = useCallback(async () => {
    if (!organizationId) return;
    const requestId = ++loadId.current;
    setOverviewLoading(true);
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
    setOverviewLoading(false);
  }, [organizationId, setUsers, fetchCalendarItems]);

  useFocusEffect(useCallback(() => {
    void loadAll();
    return () => { loadId.current += 1; };
  }, [loadAll]));

  const handleAddUser = async (data: AddUserFormData) => {
    if (!currentUserProfile?.organization_id) {
      Alert.alert("Error", "Organization or user information is missing.");
      return;
    }
    if (!token) {
      Alert.alert("Error", "No token");
      return; //  DO NOT return string on submit
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
      if (res.tempPassword) {
        setTempPassword(res.tempPassword);
      }
      const updatedUsers = await fetchUsersService(
        currentUserProfile.organization_id,
      );
      setUsers(updatedUsers);
      Alert.alert("Success", "User added successfully.");
      setAddUserModalVisible(false);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Failed to add user.");
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
        contentContainerStyle={tw`px-4 pt-6 pb-10`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <AdminOverview
          overview={overview}
          loading={overviewLoading}
          error={overviewError}
          onReviewLeaves={() => router.push("/(admin)/leave")}
          onViewAttendance={() => router.push("/(admin)/more/attendance-list")}
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
              onPress: () => router.replace("/(admin)/leave"),
            },
            {
              label: "Attendance",
              icon: <Clock size={24} color={colors.primary} />,
              onPress: () => router.replace("/(admin)/more/attendance-list"),
            },
            {
              label: "Holidays",
              icon: <FileText size={24} color={colors.primary} />,
              onPress: () => router.replace("/(admin)/more/holidays"),
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
        onClose={() => setAddUserModalVisible(false)}
        onSubmit={handleAddUser}
        supervisors={users}
        currentUserId={user?.id ?? ""}
        isSubmitting={isSubmittingUser}
      />
      {tempPassword && (
        <TempPasswordModal
          tempPassword={tempPassword}
          setTempPassword={setTempPassword}
        />
      )}
    </View>
  );
}
