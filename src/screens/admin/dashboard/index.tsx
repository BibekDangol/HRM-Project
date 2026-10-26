import AddUserModal, { AddUserFormData } from "../manage-users/AddUserModal";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import QuickActionGrid from "@/src/components/ui/QuickActionGrid";
import MetricCard from "@/src/components/ui/MetricCard";
import TempPasswordModal from "../manage-users/TempPasswordModal";
import { CalendarPlus, Clock, FileText, User, UserPlus } from "lucide-react-native";
import { adminAddUserService } from "@/src/services/admin/add-user-service";
import { fetchUsersService } from "@/src/services/admin.service";
import tw from "twrnc";
import { useAdminCalendar } from "@/src/hooks/admin/useAdminCalendar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
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

  const organizationId = currentUserProfile?.organization_id;

  const loadAll = useCallback(async () => {
    try {
      if (!organizationId) return;
      const updatedUsers = await fetchUsersService(organizationId);
      setUsers(updatedUsers);
      await fetchCalendarItems(organizationId);
    } catch {
      Alert.alert("Error", "Failed to load dashboard data.");
    }
  }, [organizationId, setUsers, fetchCalendarItems]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

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
    <View style={tw`flex-1`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-6 pb-10`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MetricCard
          title="Total Employees"
          value={totalusers}
          icon={<User size={24} color="white" />}
        />

        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          onViewAll={() => router.push("/(admin)/holidays")}
        />
        <QuickActionGrid
          items={[
            {
              label: "Add Employee",
              icon: <UserPlus size={24} color="#1B4A5A" />,
              onPress: () => setAddUserModalVisible(true),
            },
            {
              label: "Manage Leave",
              icon: <CalendarPlus size={24} color="#1B4A5A" />,
              onPress: () => router.replace("/(admin)/leave"),
            },
            {
              label: "Attendance",
              icon: <Clock size={24} color="#1B4A5A" />,
              onPress: () => router.replace("/(admin)/more/attendance-list"),
            },
            {
              label: "Holidays",
              icon: <FileText size={24} color="#1B4A5A" />,
              onPress: () => router.replace("/(admin)/more/holidays"),
            },
          ]}
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
