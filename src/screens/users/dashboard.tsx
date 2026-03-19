import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ProfileData } from "@/src/types/profile.types";
import { AttendanceRow } from "@/src/types/user";
import {
  getNepalMonthDateRangeYYYYMMDD,
  getNepalMonthRangeUTCISO,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
  normalize,
} from "@/src/utils/userDashboard";
import { router } from "expo-router";
import { CalendarDays } from "lucide-react-native";
import tw from "twrnc";
import { ActivityRecord, CalendarItem } from "@/src/types/Calendar";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);

  const now = new Date();
  const initialYear = Math.min(now.getFullYear(), MAX_YEAR);

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(
    now.getMonth(),
  );
  const [monthModalOpen, setMonthModalOpen] = useState(false);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    incomplete: 0,
  });

  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const [activityLog, setActivityLog] = useState<ActivityRecord[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const monthTitle = useMemo(
    () => MONTHS[selectedMonthIndex],
    [selectedMonthIndex],
  );
  const yearTitle = useMemo(() => `${selectedYear}`, [selectedYear]);

  const fullName = useMemo(() => {
    return `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  }, [profile?.first_name, profile?.last_name]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setProfileLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, organization_id, organization(name)",
        )
        .eq("id", user.id)
        .single();
      if (error) throw error;
      setProfile(data as ProfileData);
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to load profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  }, [user?.id]);

  const fetchMonthlyAttendanceStats = useCallback(
    async (year: number, monthIndex: number) => {
      if (!user?.id) return;
      setStatsLoading(true);
      try {
        const { startDate, endDateExclusive } = getNepalMonthDateRangeYYYYMMDD(
          year,
          monthIndex,
        );

        const tryDate = await supabase
          .from("attendance")
          .select("status, check_in_comment, date")
          .eq("user_id", user.id)
          .gte("date", startDate)
          .lt("date", endDateExclusive);

        if (!tryDate.error) {
          const rows = (tryDate.data ?? []) as AttendanceRow[];
          const present = rows.filter(
            (r) => normalize(r.status) === "present",
          ).length;
          const absent = rows.filter(
            (r) => normalize(r.status) === "absent",
          ).length;
          const incomplete = rows.filter(
            (r) => normalize(r.status) === "incomplete",
          ).length;
          const late = rows.filter(
            (r) => normalize(r.check_in_comment) !== "",
          ).length;
          setStats({ present, absent, late, incomplete });
          return;
        }

        const { startISO, endISO } = getNepalMonthRangeUTCISO(year, monthIndex);
        const tryCreatedAt = await supabase
          .from("attendance")
          .select("status, check_in_comment, created_at")
          .eq("user_id", user.id)
          .gte("created_at", startISO)
          .lt("created_at", endISO);

        if (tryCreatedAt.error) throw new Error(tryCreatedAt.error.message);

        const rows = (tryCreatedAt.data ?? []) as AttendanceRow[];
        const present = rows.filter(
          (r) => normalize(r.status) === "present",
        ).length;
        const absent = rows.filter(
          (r) => normalize(r.status) === "absent",
        ).length;
        const incomplete = rows.filter(
          (r) => normalize(r.status) === "incomplete",
        ).length;
        const late = rows.filter(
          (r) => normalize(r.check_in_comment) !== "",
        ).length;
        setStats({ present, absent, late, incomplete });
      } catch (e: unknown) {
        Alert.alert(
          "Attendance Error",
          e instanceof Error ? e.message : "Failed to load attendance stats.",
        );
        setStats({ present: 0, absent: 0, late: 0, incomplete: 0 });
      } finally {
        setStatsLoading(false);
      }
    },
    [user?.id],
  );

  const fetchCalendarItems = useCallback(
    async (year: number, monthIndex: number, orgId: string | number) => {
      const monthStr = String(monthIndex + 1).padStart(2, "0");
      const monthStart = `${year}-${monthStr}-01`;
      const monthEnd = `${year}-${monthStr}-${String(
        new Date(year, monthIndex + 1, 0).getDate(),
      ).padStart(2, "0")}`;
      setCalendarLoading(true);
      try {
        const { data, error } = await supabase
          .from("admin_calendar")
          .select("id, title, type, color, start_date, end_date")
          .eq("organization_id", orgId)
          .lte("start_date", monthEnd)
          .or(`end_date.gte.${monthStart},end_date.is.null`)
          .order("start_date", { ascending: true });
        if (error) throw error;
        setCalendarItems((data ?? []) as CalendarItem[]);
      } catch (e: unknown) {
        console.log(
          "Calendar fetch error:",
          e instanceof Error ? e.message : e,
        );
      } finally {
        setCalendarLoading(false);
      }
    },
    [],
  );

  const fetchActivityLog = useCallback(async () => {
    if (!user?.id) return;
    setActivityLoading(true);
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("attendance")
        .select(
          "id, date, status, check_in_time, check_out_time, check_in_comment",
        )
        .eq("user_id", user.id)
        .gte("date", fmt(sevenDaysAgo))
        .lte("date", fmt(today))
        .order("date", { ascending: false });

      if (error) throw error;
      setActivityLog((data ?? []) as ActivityRecord[]);
    } catch (e: unknown) {
      console.log("Activity log error:", e instanceof Error ? e.message : e);
    } finally {
      setActivityLoading(false);
    }
  }, [user?.id]);

  const refetchAll = useCallback(async () => {
    if (!user?.id) return;
    const tasks: Promise<any>[] = [
      fetchProfile(),
      fetchMonthlyAttendanceStats(selectedYear, selectedMonthIndex),
      fetchActivityLog(),
    ];
    if (profile?.organization_id) {
      tasks.push(
        fetchCalendarItems(
          selectedYear,
          selectedMonthIndex,
          profile.organization_id,
        ),
      );
    }
    await Promise.all(tasks);
  }, [
    user?.id,
    fetchProfile,
    fetchMonthlyAttendanceStats,
    fetchCalendarItems,
    fetchActivityLog,
    selectedYear,
    selectedMonthIndex,
    profile?.organization_id,
  ]);

  const onRefresh = async () => {
    const start = Date.now();
    try {
      setIsRefreshing(true);
      await refetchAll();
    } finally {
      const elapsed = Date.now() - start;
      const remaining = 2000 - elapsed;
      if (remaining > 0) {
        await new Promise((r) => setTimeout(r, remaining));
      }
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!user?.id) return;
    fetchMonthlyAttendanceStats(selectedYear, selectedMonthIndex);
  }, [user?.id, selectedYear, selectedMonthIndex, fetchMonthlyAttendanceStats]);

  useEffect(() => {
    if (!profile?.organization_id) return;
    fetchCalendarItems(
      selectedYear,
      selectedMonthIndex,
      profile.organization_id,
    );
  }, [
    profile?.organization_id,
    selectedYear,
    selectedMonthIndex,
    fetchCalendarItems,
  ]);

  useEffect(() => {
    fetchActivityLog();
  }, [fetchActivityLog]);

  const canIncYear = selectedYear < MAX_YEAR;
  const canDecYear = selectedYear > MIN_YEAR;

  return (
    <ScrollView
      style={tw`bg-white flex-1 p-4`}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || profileLoading || statsLoading}
          onRefresh={onRefresh}
          colors={["#1B4A5A"]}
          tintColor="#1B4A5A"
        />
      }
    >
      {/* Attendance for this Month */}
      <View style={tw`bg-white p-2`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>
            Attendance for {monthTitle} {yearTitle}
          </Text>

          <Pressable
            onPress={() => setMonthModalOpen(true)}
            style={({ pressed }) => [
              tw`px-3 py-2 rounded-full`,
              pressed && { opacity: 0.85 },
            ]}
          >
            <CalendarDays />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={tw`flex-row gap-3`}>
          {[
            {
              label: "Present",
              value: stats.present,
              color: "#008080",
              bg: "#E6F4F4",
            },
            {
              label: "Absent",
              value: stats.absent,
              color: "#EF4444",
              bg: "#FEE2E2",
            },
            {
              label: "Late in",
              value: stats.late,
              color: "#FFC107",
              bg: "#FFFBEB",
            },
          ].map((item) => (
            <View
              key={item.label}
              style={[
                tw`flex-1 rounded-2xl px-3 py-4 items-center gap-1`,
                { backgroundColor: item.bg },
              ]}
            >
              <Text
                style={[tw`text-4xl font-extrabold`, { color: item.color }]}
              >
                {statsLoading ? "—" : item.value}
              </Text>
              <Text style={[tw`text-xs font-semibold`, { color: "#6B7280" }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Calendar */}
      <HolidaysEventsSection
        calendarItems={calendarItems}
        calendarLoading={calendarLoading}
        monthTitle={monthTitle}
        selectedYear={selectedYear}
        onViewAll={() => router.push("/(users)/holidays")}
      />

      {/* Activity Log */}
      <View style={tw`mt-5 p-2`}>
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <Text style={tw`text-lg font-bold text-gray-800`}>
            Recent Activity
          </Text>
          <Text style={tw`text-xs text-gray-400`}>Last 7 days</Text>
        </View>

        {activityLoading ? (
          <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
            <Text style={tw`text-gray-400 text-sm`}>Loading…</Text>
          </View>
        ) : activityLog.length === 0 ? (
          <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
            <Text style={tw`text-gray-600 text-sm`}>No recent activity</Text>
            <Text style={tw`text-gray-400 text-xs mt-1`}>
              No records found for the last 7 days
            </Text>
          </View>
        ) : (
          <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
            {activityLog.map((record, i) => {
              const s = normalize(record.status);
              const isPresent = s === "present";
              const isLate = normalize(record.check_in_comment ?? "") !== "";
              const isAbsent = s === "absent";
              const isIncomplete = s === "incomplete";

              const statusLabel = isLate
                ? "Late"
                : isPresent
                  ? "Present"
                  : isAbsent
                    ? "Absent"
                    : isIncomplete
                      ? "Incomplete"
                      : s;
              const statusColor = isAbsent
                ? "#dc2626"
                : isLate
                  ? "#d97706"
                  : isIncomplete
                    ? "#7c3aed"
                    : "#16a34a";
              const statusBg = isAbsent
                ? "#fee2e2"
                : isLate
                  ? "#fef3c7"
                  : isIncomplete
                    ? "#ede9fe"
                    : "#dcfce7";

              const fmtTime = (t: string | null) => {
                if (!t) return "—";
                const date = new Date(t);
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
              };

              const fmtDate = (d: string) => {
                const date = new Date(d + "T00:00:00");
                return date.toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
              };

              return (
                <View
                  key={record.id}
                  style={[
                    tw`flex-row items-center px-4 py-3.5`,
                    i < activityLog.length - 1 && tw`border-b border-slate-50`,
                  ]}
                >
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-sm text-gray-800`}>
                      {fmtDate(record.date)}
                    </Text>
                    {record.check_in_comment ? (
                      <Text
                        style={tw`text-xs text-gray-400 mt-0.5`}
                        numberOfLines={1}
                      >
                        &ldquo;{record.check_in_comment}&rdquo;
                      </Text>
                    ) : (
                      <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                        In: {fmtTime(record.check_in_time)} · Out:{" "}
                        {fmtTime(record.check_out_time)}
                      </Text>
                    )}
                  </View>

                  <View
                    style={[
                      tw`px-2.5 py-1 rounded-full`,
                      { backgroundColor: statusBg },
                    ]}
                  >
                    <Text
                      style={[tw`text-xs font-bold`, { color: statusColor }]}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Month Picker Modal */}
      <Modal
        visible={monthModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setMonthModalOpen(false)}
      >
        <Pressable
          style={tw`flex-1 bg-black/50 justify-end`}
          onPress={() => setMonthModalOpen(false)}
        >
          <Pressable
            style={[
              tw`rounded-t-3xl px-5 pt-3 pb-8`,
              { backgroundColor: "#ffffff" },
            ]}
            onPress={() => {}}
          >
            {/* Handle */}
            <View style={tw`items-center mb-4`}>
              <View
                style={[
                  tw`h-1 w-10 rounded-full`,
                  { backgroundColor: "#008080" },
                ]}
              />
            </View>

            {/* Year stepper */}
            <View style={tw`flex-row items-center justify-center gap-5 mb-5`}>
              <Pressable
                disabled={!canDecYear}
                onPress={() =>
                  setSelectedYear((y) => Math.max(MIN_YEAR, y - 1))
                }
                style={({ pressed }) => [
                  tw`h-9 w-9 rounded-full items-center justify-center border`,
                  { borderColor: "#e2e8f0", backgroundColor: "#fff" },
                  (!canDecYear || pressed) && { opacity: 0.4 },
                ]}
              >
                <Text style={[tw`font-bold text-base`, { color: "#1F2937" }]}>
                  ‹
                </Text>
              </Pressable>

              <Text
                style={[
                  tw`text-lg font-bold w-16 text-center`,
                  { color: "#1F2937" },
                ]}
              >
                {selectedYear}
              </Text>
              <Pressable
                disabled={!canIncYear}
                onPress={() => {
                  const newYear = Math.min(MAX_YEAR, selectedYear + 1);
                  setSelectedYear(newYear);
                  const now = new Date();
                  if (
                    newYear === now.getFullYear() &&
                    selectedMonthIndex > now.getMonth()
                  ) {
                    setSelectedMonthIndex(now.getMonth());
                  }
                }}
                style={({ pressed }) => [
                  tw`h-9 w-9 rounded-full items-center justify-center border`,
                  { borderColor: "#e2e8f0", backgroundColor: "#fff" },
                  (!canIncYear || pressed) && { opacity: 0.4 },
                ]}
              >
                <Text style={[tw`font-bold text-base`, { color: "#1F2937" }]}>
                  ›
                </Text>
              </Pressable>
            </View>

            {/* 3-col Month grid */}
            <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
              {MONTHS.map((m, idx) => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth();

                const isFuture =
                  selectedYear === currentYear && idx > currentMonth;

                const isActive = idx === selectedMonthIndex && !isFuture;

                const isCurrent =
                  idx === currentMonth && selectedYear === currentYear;

                return (
                  <Pressable
                    key={m}
                    disabled={isFuture}
                    onPress={() => {
                      setSelectedMonthIndex(idx);
                      setMonthModalOpen(false);
                    }}
                    style={({ pressed }) => [
                      tw`py-3 rounded-2xl items-center justify-center`,
                      { width: "31%" },
                      isActive
                        ? { backgroundColor: "#008080" }
                        : isCurrent
                          ? {
                              backgroundColor: "#FFFBEB",
                              borderWidth: 1.5,
                              borderColor: "#FFC107",
                            }
                          : isFuture
                            ? { backgroundColor: "#F9FAFB" }
                            : { backgroundColor: "#F3F4F6" },
                      pressed && !isFuture && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-semibold text-center`,
                        isActive
                          ? { color: "#ffffff" }
                          : isFuture
                            ? { color: "#CBD5E1" }
                            : { color: "#1F2937" },
                      ]}
                    >
                      {m}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Done */}
            <Pressable
              onPress={() => setMonthModalOpen(false)}
              style={({ pressed }) => [
                tw`py-4 rounded-full items-center`,
                { backgroundColor: "#FFC107" },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={[tw`font-bold text-base`, { color: "#1F2937" }]}>
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
