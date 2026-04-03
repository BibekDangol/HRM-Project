import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import AddUserModal, { AddUserFormData } from "../manage-users/AddUserModal";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import { useAdminCalendar } from "@/src/hooks/admin/useAdminCalendar";
import StatCard from "@/src/screens/admin/components/StatCard";
import { fetchUsersService } from "@/src/services/admin.service";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { MONTHS } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import { User } from "lucide-react-native";
import tw from "twrnc";
import QuickAction from "../components/QuickAction";
import TempPasswordModal from "../manage-users/TempPasswordModal";

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const token = session?.access_token;
  const { users, userProfile, setUsers } = useUsersStore();
  const {
    calendarItems,
    calendarLoading,
    selectedMonthIndex,
    selectedYear,
    fetchCalendarItems,
  } = useAdminCalendar();

  const [refreshing, setRefreshing] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const totalusers = users.length;

  const supervisors = useMemo(() => {
    return users.filter((u) =>
      ["admin", "hr", "supervisor"].includes(String(u.role).toLowerCase()),
    );
  }, [users]);

  const monthTitle = useMemo(
    () => MONTHS[selectedMonthIndex],
    [selectedMonthIndex],
  );

  const loadAll = useCallback(async () => {
    try {
      if (!userProfile?.organization_id) return;
      const updatedUsers = await fetchUsersService(userProfile.organization_id);
      setUsers(updatedUsers);
      await fetchCalendarItems(userProfile.organization_id);
    } catch {
      Alert.alert("Error", "Failed to load dashboard data.");
    }
  }, [userProfile?.organization_id, setUsers, fetchCalendarItems]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAddUser = async (data: AddUserFormData) => {
    if (!userProfile?.organization_id) {
      Alert.alert("Error", "Organization or user information is missing.");
      return;
    }
    if (!token) {
      Alert.alert("Error", "No token");
      return; //  DO NOT return string on submit kura haru
    }
    try {
      setIsSubmittingUser(true);
      const res = await adminAddUserService({
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        orgId: userProfile.organization_id,
        supervisor_id: data.supervisor_id,
      });
      if (res.tempPassword) {
        setTempPassword(res.tempPassword);
      }
      const updatedUsers = await fetchUsersService(userProfile.organization_id);
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
    <View style={tw`flex-1`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-6 pb-10`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={tw`font-semibold ${TW.textPrimary} py-2 text-lg`}>
          High-Level Metrics
        </Text>

        <StatCard
          title="Total Employees"
          value={totalusers}
          icon={<User size={24} color="white" />}
        />

        <QuickAction onOpenAddUserModal={() => setAddUserModalVisible(true)} />

        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          monthTitle={monthTitle}
          selectedYear={selectedYear}
          onViewAll={() => router.push("/(admin)/holidays")}
        />
      </ScrollView>

      <AddUserModal
        visible={addUserModalVisible}
        onClose={() => setAddUserModalVisible(false)}
        onSubmit={handleAddUser}
        supervisors={supervisors}
        currentUserId={""}
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
