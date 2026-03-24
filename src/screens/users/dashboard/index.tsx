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

import { ActivityLogSection } from "@/src/components/ActivityLog";
import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";
import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { CalendarItem } from "@/src/types/Calendar";
import { ProfileData } from "@/src/types/profile.types";
import { AttendanceRow } from "@/src/types/user";
import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
import {
  getNepalMonthDateRangeYYYYMMDD,
  getNepalMonthRangeUTCISO,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
  normalize,
} from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import { router } from "expo-router";
import { CalendarDays, CircleCheck, LogOut } from "lucide-react-native";
import tw from "twrnc";

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const att = useAttendanceContext();

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

  const refetchAll = useCallback(async () => {
    if (!user?.id) return;
    const tasks: Promise<any>[] = [
      fetchProfile(),
      fetchMonthlyAttendanceStats(selectedYear, selectedMonthIndex),
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

  const canIncYear = selectedYear < MAX_YEAR;
  const canDecYear = selectedYear > MIN_YEAR;

  return (
    <>
      <ScrollView
        style={tw`bg-white flex-1`}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || profileLoading || statsLoading}
            onRefresh={onRefresh}
            colors={["#1B4A5A"]}
            tintColor="#1B4A5A"
          />
        }
      >
        {/* ── Check In / Out Card ── */}
        <View style={{ paddingHorizontal: 16 }}>
          <View
            style={{
              borderRadius: 20,
              backgroundColor: TW.bgSecondary,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 4,
              marginBottom: 16,
            }}
          >
            {/* Left: status + timer */}
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  fontWeight: "500",
                }}
              >
                {att.isCheckedIn ? "Currently working" : "Not checked in"}
              </Text>
              {att.isCheckedIn ? (
                <>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: "800",
                      color: "#ffffff",
                      letterSpacing: -0.5,
                    }}
                  >
                    {formatElapsed(att.elapsedMs)}
                  </Text>
                  <Text
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}
                  >
                    Since{" "}
                    {att.checkedInAt ? formatSinceTime(att.checkedInAt) : "--"}
                  </Text>
                </>
              ) : (
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  --:--:--
                </Text>
              )}
            </View>

            {/* Right: button */}
            <Pressable
              disabled={att.isLocked}
              onPress={att.onToggleCheck}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 18,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: "#FFB300",
                opacity: att.isLocked || pressed ? 0.7 : 1,
              })}
            >
              {att.isCheckedIn ? (
                <LogOut size={15} color="#1F2937" />
              ) : (
                <CircleCheck size={15} color="#1F2937" />
              )}
              <Text
                style={{ fontWeight: "700", fontSize: 13, color: "#1F2937" }}
              >
                {att.isLocked
                  ? "..."
                  : att.isCheckedIn
                    ? "Check Out"
                    : "Check In"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Attendance for this Month ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <View style={tw`flex-row items-center justify-between mb-4`}>
            <Text style={tw`font-semibold ${TW.textPrimary} text-lg`}>
              Attendance for {monthTitle} {yearTitle}
            </Text>
            <Pressable
              onPress={() => setMonthModalOpen(true)}
              style={({ pressed }) => [
                tw`px-3 py-2 rounded-full`,
                pressed && { opacity: 0.85 },
              ]}
            >
              <CalendarDays color="#475569" />
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
                <Text style={[tw`text-sm font-semibold`, { color: "#6B7280" }]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Holidays & Events ── */}
        <View style={{ paddingHorizontal: 16 }}>
          <HolidaysEventsSection
            calendarItems={calendarItems}
            calendarLoading={calendarLoading}
            monthTitle={monthTitle}
            selectedYear={selectedYear}
            onViewAll={() => router.push("/(users)/holidays")}
          />
        </View>

        {/* ── Activity Log ── */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <ActivityLogSection
            onViewAll={() => router.push("/(users)/activity-log")}
          />
        </View>
        {/* ── Month Picker Modal ── */}
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
    </>
  );
}
