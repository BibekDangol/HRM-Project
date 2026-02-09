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

const NEPAL_OFFSET_MIN = 5 * 60 + 45;
const MAX_YEAR = 2026;
// If you want a min year too, change it here:
const MIN_YEAR = 2000;

function normalize(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getNepalMonthDateRangeYYYYMMDD(
  selectedYear: number,
  selectedMonthIndex: number,
) {
  const nepalStartLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex, 1, 0, 0, 0),
  );
  const nepalEndLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex + 1, 1, 0, 0, 0),
  );

  const startUTC = new Date(
    nepalStartLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );
  const endUTC = new Date(
    nepalEndLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );

  const start = startUTC.toISOString().slice(0, 10);
  const end = endUTC.toISOString().slice(0, 10);

  return { startDate: start, endDateExclusive: end };
}

function getNepalMonthRangeUTCISO(
  selectedYear: number,
  selectedMonthIndex: number,
) {
  const nepalStartLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex, 1, 0, 0, 0),
  );
  const nepalEndLocalAsUTC = new Date(
    Date.UTC(selectedYear, selectedMonthIndex + 1, 1, 0, 0, 0),
  );

  const startUTC = new Date(
    nepalStartLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );
  const endUTC = new Date(
    nepalEndLocalAsUTC.getTime() - NEPAL_OFFSET_MIN * 60 * 1000,
  );

  return { startISO: startUTC.toISOString(), endISO: endUTC.toISOString() };
}

type AttendanceRow = {
  status: string | null;
  check_in_comment: string | null;
  date?: string | null;
  created_at?: string | null;
};

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

  const refetchAll = useCallback(async () => {
    if (!user?.id) return;
    await Promise.all([
      fetchProfile(),
      fetchMonthlyAttendanceStats(selectedYear, selectedMonthIndex),
    ]);
  }, [
    user?.id,
    fetchProfile,
    fetchMonthlyAttendanceStats,
    selectedYear,
    selectedMonthIndex,
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
          <Text style={tw`text-3xl font-extrabold text-green-700`}>
            {profile?.organization?.name ?? "—"}
          </Text>
        </Text>

        <Text style={tw`text-xl text-gray-600 mt-1`}>
          Greetings,{" "}
          <Text style={tw`text-gray-600 text-xl`}>{fullName || "—"}</Text>
        </Text>
      </View>

      {/* Attendance for this Month */}
      <View style={tw`bg-gray-50 p-4`}>
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
              tw`bg-purple-100 px-4 py-3 rounded-full border border-purple-200`,
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
