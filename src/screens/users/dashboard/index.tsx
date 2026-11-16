import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
import { MAX_YEAR, MONTHS } from "@/src/utils/userDashboard";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import { AttendanceStatsCard } from "@/src/components/Home/AttendanceStatsCard";
import { CheckInCard } from "@/src/components/Home/CheckInCard";
import { MonthPickerModal } from "@/src/components/Home/MonthPickerModal";
import { ActivityLogSection } from "@/src/components/RecentActivity";
import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useAttendanceStats } from "@/src/hooks/users/useAttendanceStats";
import { useCalendar } from "@/src/hooks/users/useCalendar";
import { useProfile } from "@/src/hooks/useProfile";
import { useAuthStore } from "@/src/store/useAuthStore";
import { router } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import tw from "twrnc";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const att = useAttendanceContext();

  const now = new Date();

  const [selectedYear, setSelectedYear] = useState(
    Math.min(now.getFullYear(), MAX_YEAR),
  );
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { profile, fetchProfile } = useProfile(user?.id);

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
      contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || calendarLoading || statsLoading}
          onRefresh={onRefresh}
        />
      }
    >
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
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`font-semibold text-lg text-gray-800`}>
            For {monthTitle} {selectedYear}
          </Text>

          <Pressable
            onPress={() => setShowMonthPicker(true)}
            style={({ pressed }) => [
              tw`px-3 py-2 rounded-full`,
              pressed && { opacity: 0.7 },
            ]}
          >
            <CalendarDays size={20} color="#475569" />
          </Pressable>
        </View>

        <AttendanceStatsCard stats={stats} loading={statsLoading} />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        <HolidaysEventsSection
          calendarItems={calendarItems}
          calendarLoading={calendarLoading}
          onViewAll={() => router.push("/(users)/holidays")}
        />
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
        <ActivityLogSection
          onViewAll={() => router.push("/(users)/activity-log")}
        />
      </View>

      <MonthPickerModal
        visible={showMonthPicker}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
        onClose={() => setShowMonthPicker(false)}
      />
    </ScrollView>
  );
}
