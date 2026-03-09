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

import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ProfileData } from "@/src/types/profile";
import { CalendarDays } from "lucide-react-native";
import tw from "twrnc";
import { AttendanceRow } from "@/src/types/user";
import {
  getNepalMonthDateRangeYYYYMMDD,
  getNepalMonthRangeUTCISO,
  MAX_YEAR,
  MIN_YEAR,
  MONTHS,
  normalize,
} from "@/src/utils/userDashboard";
import { HolidaysEventsSection } from "@/src/components/HolidaysEventsSection";

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

  type CalendarItem = {
    id: string;
    title: string;
    type: "holiday" | "event";
    color: string;
    start_date: string;
    end_date: string | null;
  };
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);

  type ActivityRecord = {
    id: string;
    date: string;
    status: string;
    check_in_time: string | null;
    check_out_time: string | null;
    check_in_comment: string | null;
  };
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

        // Prefer querying by attendance.date (YYYY-MM-DD)
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

        // Fallback: query by created_at within month range (UTC ISO)
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
      const monthEnd = `${year}-${monthStr}-${String(new Date(year, monthIndex + 1, 0).getDate()).padStart(2, "0")}`;
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
      // Last 7 days from today
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
        />
      }
    >
      {/* Header */}
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-gray-700`}>
          Welcome to{" "}
          <Text style={tw`text-3xl font-extrabold text-[#F7A44B]]`}>
            {profile?.organization?.name ?? "—"}
          </Text>
        </Text>

        <Text style={tw`text-xl text-gray-600 mt-1`}>
          Greetings,{" "}
          <Text style={tw`text-gray-600 text-xl`}>{fullName || "—"}</Text>
        </Text>
      </View>

      {/* Attendance for this Month */}
      <View style={tw`bg-white p-2`}>
        <View style={tw`flex-row items-center justify-between mb-4`}>
          <View>
            <Text style={tw`text-lg font-bold text-gray-800`}>
              Attendance for {monthTitle}
            </Text>
            <Text style={tw`text-gray-500 mt-1`}>{yearTitle}</Text>
          </View>

          <Pressable
            onPress={() => setMonthModalOpen(true)}
            style={({ pressed }) => [
              tw` px-4 py-3 rounded-full `,
              pressed && { opacity: 0.85 },
            ]}
          >
            <CalendarDays />
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={tw`flex-row gap-3`}>
          <View style={tw`flex-1 rounded-xl p-4 bg-green-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-green-600`}>
              {statsLoading ? "…" : stats.present}
            </Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Present</Text>
          </View>

          <View style={tw`flex-1 rounded-xl p-4 bg-red-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-red-500`}>
              {statsLoading ? "…" : stats.absent}
            </Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Absents</Text>
          </View>

          <View style={tw`flex-1 rounded-xl p-4 bg-yellow-100 items-center`}>
            <Text style={tw`text-3xl font-extrabold text-yellow-600`}>
              {statsLoading ? "…" : stats.late}
            </Text>
            <Text style={tw`text-gray-700 mt-1 font-semibold`}>Late in</Text>
          </View>
        </View>
      </View>
      <HolidaysEventsSection
        calendarItems={calendarItems}
        calendarLoading={calendarLoading}
        monthTitle={monthTitle}
        selectedYear={selectedYear}
      />

      {/* Activity Log */}
      <View style={tw`mt-5 p-2`}>
        <View style={tw`flex-row items-center justify-between mb-3`}>
          <Text
            style={tw`text-lg font-bold text-gray-800`}
          >
            Activity Log
          </Text>
          <Text style={tw`text-xs text-gray-400 `}>Last 7 days</Text>
        </View>

        {activityLoading ? (
          <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
            <Text style={tw`text-gray-400 text-sm`}>Loading…</Text>
          </View>
        ) : activityLog.length === 0 ? (
          <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
            {/* <Text style={tw`text-2xl mb-2`}>🗂️</Text> */}
            <Text style={tw`text-gray-600 text-sm`}>
              No recent activity
            </Text>
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
              // const statusIcon = isAbsent
              //   ? "✕"
              //   : isLate
              //     ? "⏰"
              //     : isIncomplete
              //       ? "…"
              //       : "✓";

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
                  {/* Icon */}
                  {/* <View
                    style={[
                      tw`w-9 h-9 rounded-2xl items-center justify-center mr-3`,
                      { backgroundColor: statusBg },
                    ]}
                  >
                    {/* <Text
                      style={[tw`text-sm font-bold`, { color: statusColor }]}
                    >
                      {statusIcon}
                    </Text> */}
                  {/* </View> */}
                  {/* Date + times */}
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

                  {/* Status pill */}
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
        animationType="fade"
        onRequestClose={() => setMonthModalOpen(false)}
      >
        <Pressable
          style={tw`flex-1 bg-black/40 justify-end`}
          onPress={() => setMonthModalOpen(false)}
        >
          <Pressable style={tw`bg-white rounded-t-3xl p-4`} onPress={() => {}}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Pressable
                disabled={!canDecYear}
                onPress={() =>
                  setSelectedYear((y) => Math.max(MIN_YEAR, y - 1))
                }
                style={({ pressed }) => [
                  tw`px-4 py-2 rounded-full border border-gray-200`,
                  (!canDecYear || pressed) && { opacity: 0.6 },
                ]}
              >
                <Text style={tw`font-semibold text-gray-800`}>- Year</Text>
              </Pressable>

              <Text style={tw`text-lg font-bold text-gray-800`}>
                {selectedYear}
              </Text>

              <Pressable
                disabled={!canIncYear}
                onPress={() =>
                  setSelectedYear((y) => Math.min(MAX_YEAR, y + 1))
                }
                style={({ pressed }) => [
                  tw`px-4 py-2 rounded-full border border-gray-200`,
                  (!canIncYear || pressed) && { opacity: 0.6 },
                ]}
              >
                <Text style={tw`font-semibold text-gray-800`}>+ Year</Text>
              </Pressable>
            </View>

            <View style={tw`flex-row flex-wrap justify-between`}>
              {MONTHS.map((m, idx) => {
                const active = idx === selectedMonthIndex;
                return (
                  <Pressable
                    key={m}
                    onPress={() => {
                      setSelectedMonthIndex(idx);
                      setMonthModalOpen(false);
                    }}
                    style={({ pressed }) => [
                      tw`w-[48%] mb-3 px-4 py-3 rounded-2xl border`,
                      active
                        ? tw`bg-purple-100 border-purple-200`
                        : tw`bg-white border-gray-200`,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text style={tw`text-gray-800 font-semibold`}>{m}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setMonthModalOpen(false)}
              style={({ pressed }) => [
                tw`mt-2 px-4 py-3 rounded-2xl bg-gray-100 items-center`,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={tw`font-semibold text-gray-800`}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
