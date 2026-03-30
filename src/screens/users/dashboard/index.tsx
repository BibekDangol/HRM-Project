import { MAX_YEAR, MONTHS } from "@/src/utils/userDashboard";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import React, { useMemo, useState } from "react";
import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";

import { ActivityLogSection } from "@/src/components/ActivityLog";
import { AttendanceStatsCard } from "@/src/components/Home/AttendanceStatsCard";
import { CalendarDays } from "lucide-react-native";
import { CheckInCard } from "@/src/components/Home/CheckInCard";
import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import { MonthPickerModal } from "@/src/components/Home/MonthPickerModal";
import { router } from "expo-router";
import tw from "twrnc";
import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useAttendanceStats } from "@/src/hooks/users/useAttendanceStats";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useCalendar } from "@/src/hooks/users/useCalendar";
import { useProfile } from "@/src/hooks/users/useProfile";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const att = useAttendanceContext();

  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(
    Math.min(now.getFullYear(), MAX_YEAR),
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [monthModalOpen, setMonthModalOpen] = useState(false);

  const { profile, loading, fetchProfile } = useProfile(user?.id);
  //ask ayush dai why its fetching non stop, not only on page refresh.????
  const {
    stats,
    loading: statsLoading,
    fetchStats,
  } = useAttendanceStats(user?.id, selectedYear, selectedMonth);

  const {
    items: calendarItems,
    loading: calendarLoading,
    fetch: fetchCalendar,
  } = useCalendar(profile?.organization_id, selectedYear, selectedMonth);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchProfile(), fetchStats(), fetchCalendar()]);
    } finally {
      setRefreshing(false);
    }
  };

  const monthTitle = useMemo(() => MONTHS[selectedMonth], [selectedMonth]);

  return (
    <ScrollView
      style={tw`bg-white flex-1`}
      contentContainerStyle={{ paddingVertical: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading || statsLoading}
          onRefresh={onRefresh}
        />
      }>
      <View style={{ paddingHorizontal: 16 }}>
        <CheckInCard
          isCheckedIn={att.isCheckedIn}
          elapsedMs={att.elapsedMs}
          checkedInAt={att.checkedInAt}
          isLocked={att.isLocked}
          onToggle={att.onToggleCheck}
          formatElapsed={formatElapsed}
          formatSinceTime={(d) => (d ? formatSinceTime(d) : "")}
        />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`font-semibold text-lg text-gray-800`}>
            For {monthTitle} {selectedYear}
          </Text>
          <Pressable
            onPress={() => setMonthModalOpen(true)}
            style={({ pressed }) => [
              tw`px-3 py-2 rounded-full`,
              pressed && { opacity: 0.7 },
            ]}>
            <CalendarDays size={20} color="#475569" />
          </Pressable>
        </View>
        <AttendanceStatsCard stats={stats} loading={statsLoading} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          monthTitle={monthTitle}
          selectedYear={selectedYear}
          onViewAll={() => router.push("/(users)/holidays")}
        />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <ActivityLogSection
          onViewAll={() => router.push("/(users)/activity-log")}
        />
      </View>

      <MonthPickerModal
        visible={monthModalOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
        onClose={() => setMonthModalOpen(false)}
      />
    </ScrollView>
  );
}
