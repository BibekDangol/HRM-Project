import { CircleCheckBig, User } from "lucide-react-native";
import * as React from "react";
import { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import tw from "twrnc";

import {
  CalendarItem,
  HolidaysEventsSection,
} from "@/src/components/HolidaysEventsSection";
import StatCard from "@/src/screens/admin/components/StatCard";
import { fetchUsersService } from "@/src/services/admin.service";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";

import { supabase } from "@/src/supabase/supabaseClient";
import { MONTHS } from "@/src/utils/userDashboard";
import { router } from "expo-router";

export default function DashboardScreen() {
  const { setUserProfile, users, setUsers } = useUsersStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Calendar state
  const now = new Date();
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const monthTitle = React.useMemo(
    () => MONTHS[selectedMonthIndex],
    [selectedMonthIndex],
  );

  const totalusers = users.length;

  // Load users and current user profile
  const loadUsers = async () => {
    if (!user) return;
    try {
      const profile = await fetchCurrentUserProfleService(user.id);
      setUserProfile(profile);

      const res = await fetchUsersService(profile.organization_id);
      setUsers(res);

      // Fetch calendar items for the organization
      if (profile.organization_id) {
        await fetchCalendarItems(profile.organization_id);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to load users or profile.");
    }
  };

  // Pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  // Fetch calendar items from Supabase
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

  // Load data on mount
  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-6 pb-10`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1F7A4D"]}
            tintColor="#1F7A4D"
          />
        }
      >
        <Text style={tw`mb-2 font-bold text-xl`}>Dashboard</Text>

        {/* Stats Cards */}
        <View style={tw`flex-row flex-wrap justify-between mb-4`}>
          <StatCard
            title="Total Employees"
            value={totalusers}
            icon={<User size={24} color="white" />}
          />
          <StatCard
            title="Total Projects"
            value={1}
            icon={<CircleCheckBig size={24} color="white" />}
          />
        </View>

        {/* Holidays & Events Section */}
        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          monthTitle={monthTitle}
          selectedYear={selectedYear}
          onViewAll={() => router.push("/(admin)/holidays")}
        />
      </ScrollView>
    </View>
  );
}
