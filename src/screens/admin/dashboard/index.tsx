import {
  CalendarItem,
  HolidaysEventsSection,
} from "@/src/components/HolidaysEventsSection";

import { User } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";

import StatCard from "@/src/screens/admin/components/StatCard";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { MONTHS } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import tw from "twrnc";
import QuickAction from "../components/QuickAction";
import AddUserModal, { AddUserFormData } from "../manage-users/AddUserModal";

export default function DashboardScreen() {
  const router = useRouter();
  const { setUserProfile, users, setUsers, userProfile } = useUsersStore();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  // Calendar state
  const now = new Date();
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const monthTitle = useMemo(
    () => MONTHS[selectedMonthIndex],
    [selectedMonthIndex],
  );

  const totalusers = users.length;

  const supervisors = useMemo(() => {
    return users.filter((u) =>
      ["admin", "hr", "supervisor"].includes(String(u.role).toLowerCase()),
    );
  }, [users]);

  const loadUsers = async () => {
    if (!user) return;

    try {
      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);

      const res = await fetchUsersService(profile.organization_id);
      setUsers(res);

      if (profile.organization_id) {
        await fetchCalendarItems(profile.organization_id);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load users or profile.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const fetchCalendarItems = async (orgId: string | number) => {
    setCalendarLoading(true);

    try {
      const monthStr = String(selectedMonthIndex + 1).padStart(2, "0");
      const monthStart = `${selectedYear}-${monthStr}-01`;
      const monthEnd = `${selectedYear}-${monthStr}-${String(
        new Date(selectedYear, selectedMonthIndex + 1, 0).getDate(),
      ).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("admin_calendar")
        .select("id, title, type, color, start_date, end_date")
        .eq("organization_id", orgId)
        .lte("start_date", monthEnd)
        .or(`end_date.gte.${monthStart},end_date.is.null`)
        .order("start_date", { ascending: true });

      if (error) throw error;
      setCalendarItems((data ?? []) as CalendarItem[]);
    } catch (err) {
      Alert.alert("Error", "Failed to load calendar items.");
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleAddUser = async (data: AddUserFormData) => {
    if (!user || !userProfile?.organization_id) {
      Alert.alert("Error", "Organization or user information is missing.");
      return;
    }

    try {
      setIsSubmittingUser(true);

      // 1. Create auth user
      const tempPassword = "Password@123"; // replace with better flow later

      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email: data.email,
          password: tempPassword,
          email_confirm: true,
        });

      if (authError) throw authError;

      const newUserId = authData.user?.id;
      if (!newUserId) {
        throw new Error("User ID not returned.");
      }

      // 2. Insert profile row
      const { error: profileError } = await supabase.from("profiles").insert({
        id: newUserId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        organization_id: userProfile.organization_id,
        supervisor_id: data.supervisor_id,
        role: "employee",
        status: "pending",
      });

      if (profileError) throw profileError;

      Alert.alert("Success", "User added successfully.");
      setAddUserModalVisible(false);
      await loadUsers();
    } catch (error: any) {
      Alert.alert("Error", error?.message ?? "Failed to add user.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={tw`flex-1`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-6 pb-10`}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1B4A5A"]}
            tintColor="#1B4A5A"
          />
        }
      >
        <Text style={tw`font-semibold ${TW.textPrimary} py-2 text-lg`}>
          High-Level Metrics
        </Text>

        <View style={tw`flex-col gap-4`}>
          <View style={tw`flex-row flex-wrap justify-between`}>
            <StatCard
              title="Total Employees"
              value={totalusers}
              icon={<User size={24} color="white" />}
            />
          </View>

          <QuickAction
            onOpenAddUserModal={() => setAddUserModalVisible(true)}
          />

          <HolidaysEventsSection
            calendarItems={calendarItems}
            calendarLoading={calendarLoading}
            monthTitle={monthTitle}
            selectedYear={selectedYear}
            onViewAll={() => router.push("/(admin)/holidays")}
          />
        </View>
      </ScrollView>

      <AddUserModal
        visible={addUserModalVisible}
        onClose={() => setAddUserModalVisible(false)}
        onSubmit={handleAddUser}
        supervisors={supervisors}
        currentUserId={user?.id ?? ""}
        isSubmitting={isSubmittingUser}
      />
    </View>
  );
}
