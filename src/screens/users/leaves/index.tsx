import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { Clock, Edit2 } from "lucide-react-native";
import tw from "twrnc";
import { supabase } from "@/src/supabase/supabaseClient";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
import {
  LeaveDetailsRow,
  LeaveTypeRowIndex,
  LeaveTypeStats,
} from "@/src/types/userLeave";
import { getLeaveDays } from "@/src/utils/leaveUtils";

const PRIMARY = "#008080";

type FilterTab = "all" | "pending" | "approved" | "rejected";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  approved: {
    label: "APPROVED",
    color: "#008080",
    bg: "#E6F4F4",
    border: "#008080",
  },
  pending: {
    label: "PENDING",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#D97706",
  },
  rejected: {
    label: "REJECTED",
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#DC2626",
  },
};

const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

const formatRange = (start: string, end: string) =>
  start === end
    ? formatDate(start)
    : `${formatDate(start)} - ${formatDate(end)}`;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function LeavesScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRowIndex[]>([]);
  const [leaves, setLeaves] = useState<LeaveDetailsRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const currentYearRange = useMemo(() => {
    const y = new Date().getFullYear();
    return { from: `${y}-01-01`, to: `${y}-12-31` };
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);

    const [
      { data: typesData, error: typesErr },
      { data: leavesData, error: leavesErr },
    ] = await Promise.all([
      supabase
        .from("leave_types")
        .select("id,name,leave_limit")
        .order("name", { ascending: true }),

      supabase
        .from("leaves")
        .select(
          "id,user_id,leave_type_id,status,start_date,end_date,day_type,days_count,created_at",
        )
        .eq("user_id", userId)
        .gte("start_date", currentYearRange.from)
        .lte("start_date", currentYearRange.to)
        .order("created_at", { ascending: false }),
    ]);

    if (typesErr) {
      setError(typesErr.message);
      return;
    }
    if (leavesErr) {
      setError(leavesErr.message);
      return;
    }

    setLeaveTypes(typesData ?? []);
    setLeaves(leavesData ?? []);
  }, [userId, currentYearRange.from, currentYearRange.to]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);
  // ─────────────────────────────────────────────────────────────

  // ── Stats per leave type ──────────────────────────────────────
  const stats: LeaveTypeStats[] = useMemo(() => {
    const byType: Record<
      number,
      { approved: number; pending: number; rejected: number }
    > = {};

    for (const lv of leaves) {
      if (!lv.leave_type_id) continue;
      const days = getLeaveDays(lv);
      const id = Number(lv.leave_type_id);
      const b = (byType[id] ??= { approved: 0, pending: 0, rejected: 0 });
      const s = String(lv.status ?? "").toLowerCase();
      if (s === "approved") b.approved += days;
      else if (s === "pending") b.pending += days;
      else if (s === "rejected") b.rejected += days;
    }

    return leaveTypes.map((t) => {
      const s = byType[t.id] ?? { approved: 0, pending: 0, rejected: 0 };
      const limit = t.leave_limit ?? 0;
      return {
        leaveTypeId: t.id,
        name: t.name ?? "Unnamed",
        limit,
        approved: s.approved,
        pending: s.pending,
        rejected: s.rejected,
        remaining: Math.max(0, limit - s.approved - s.pending),
      };
    });
  }, [leaveTypes, leaves]);
  // ─────────────────────────────────────────────────────────────

  // ── Filtered list ─────────────────────────────────────────────
  const filteredLeaves = useMemo(() => {
    if (activeTab === "all") return leaves;
    return leaves.filter(
      (l) => String(l.status ?? "").toLowerCase() === activeTab,
    );
  }, [leaves, activeTab]);
  // ─────────────────────────────────────────────────────────────

  // ── Leave type name lookup ────────────────────────────────────
  const leaveTypeName = useCallback(
    (id: number | null) => leaveTypes.find((t) => t.id === id)?.name ?? "Leave",
    [leaveTypes],
  );
  // ─────────────────────────────────────────────────────────────

  if (!userId) {
    return (
      <View style={tw`flex-1 items-center justify-center p-4`}>
        <Text style={tw`text-slate-600`}>Please sign in to view leaves.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator color={PRIMARY} />
        <Text style={tw`mt-2 text-slate-500 text-sm`}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-[#F8FAFC]`}>
      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        // ── Header: balance + tabs ────────────────────────────
        ListHeaderComponent={
          <View>
            {error && (
              <Text style={tw`text-red-500 text-xs mt-2 mb-1`}>
                Error: {error}
              </Text>
            )}

            {/* Balance label */}
            <Text
              style={{
                color: "#94A3B8",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.2,
                marginTop: 20,
                marginBottom: 12,
              }}
            >
              LEAVE BALANCE
            </Text>

            {/* Balance cards */}
            <FlatList
              data={stats}
              keyExtractor={(s) => String(s.leaveTypeId)}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              renderItem={({ item }) => (
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 16,
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    minWidth: 100,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: "#0F172A",
                      fontSize: 32,
                      fontWeight: "800",
                      lineHeight: 38,
                    }}
                  >
                    {String(item.remaining).padStart(2, "0")}
                  </Text>
                  <Text
                    style={{
                      color: "#94A3B8",
                      fontSize: 13,
                      fontWeight: "500",
                      marginTop: 4,
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              )}
            />

            {/* Filter tabs */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 24,
                marginBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#E2E8F0",
              }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={{
                      marginRight: 24,
                      paddingBottom: 12,
                      borderBottomWidth: isActive ? 2 : 0,
                      borderBottomColor: PRIMARY,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? "#0F172A" : "#94A3B8",
                      }}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        // ── Leave card ────────────────────────────────────────
        renderItem={({ item }) => {
          const status = String(item.status ?? "").toLowerCase();
          const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
          const canEdit = status === "pending" && activeTab === "pending";
          const typeName = leaveTypeName(
            item.leave_type_id ? Number(item.leave_type_id) : null,
          );

          return (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              {/* Top row: name + badge + edit */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                {/* Left: type name + date range */}
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      color: "#0F172A",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                    numberOfLines={1}
                  >
                    {typeName}
                  </Text>
                  <Text
                    style={{
                      color: "#64748B",
                      fontSize: 13,
                      marginTop: 3,
                    }}
                  >
                    {formatRange(item.start_date, item.end_date)}
                  </Text>
                </View>

                {/* Right: status badge + edit button */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: cfg.bg,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: cfg.border,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: cfg.color,
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.5,
                      }}
                    >
                      {cfg.label}
                    </Text>
                  </View>

                  {/* Edit only when pending */}
                  {canEdit && (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: "/(users)/leaves/edit",
                          params: { leaveId: item.id },
                        })
                      }
                      style={({ pressed }) => ({
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "#F1F5F9",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Edit2 size={14} color="#64748B" strokeWidth={2} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#F1F5F9",
                  marginVertical: 12,
                }}
              />

              {/* Applied on */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Clock size={13} color="#94A3B8" strokeWidth={1.8} />
                <Text style={{ color: "#94A3B8", fontSize: 12 }}>
                  Applied on{" "}
                  {item.created_at
                    ? formatDate(item.created_at.split("T")[0])
                    : "—"}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-16`}>
            <Text style={{ color: "#CBD5E1", fontSize: 14 }}>
              No {activeTab === "all" ? "" : activeTab} leaves found
            </Text>
          </View>
        }
      />

      {/* ── FAB ── */}
      <Pressable
        onPress={() => router.push("/(users)/leaves/calendar/apply")}
        style={({ pressed }) => ({
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: PRIMARY,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: PRIMARY,
          shadowOpacity: 0.4,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: "#fff", fontSize: 28, lineHeight: 32 }}>+</Text>
      </Pressable>
    </View>
  );
}
