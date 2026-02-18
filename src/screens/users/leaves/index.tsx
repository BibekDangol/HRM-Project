// app/(users)/leaves/index.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import tw from "twrnc";
import { supabase } from "@/src/supabase/supabaseClient";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LeaveDetailsRow,  LeaveTypeRowIndex, LeaveTypeStats } from "@/src/types/userLeave";
import { formatDays, getLeaveDays } from "@/src/utils/leaveUtils";



export default function LeavesDetailsScreen() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeRowIndex[]>([]);
  const [leaves, setLeaves] = useState<LeaveDetailsRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentYearRange = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const from = `${y}-01-01`;
    const to = `${y}-12-31`;
    return { from, to };
  }, []);

  const load = useCallback(async () => {
    if (!userId) return;
    setError(null);

    const { data: typesData, error: typesErr } = await supabase
      .from("leave_types")
      .select("id,name,leave_limit")
      .order("name", { ascending: true });

    if (typesErr) {
      setError(typesErr.message);
      return;
    }

    const { data: leavesData, error: leavesErr } = await supabase
      .from("leaves")
      .select(
        "id,user_id,leave_type_id,status,start_date,end_date,day_type,days_count",
      )
      .eq("user_id", userId)
      .gte("start_date", currentYearRange.from)
      .lte("start_date", currentYearRange.to);

    if (leavesErr) {
      setError(leavesErr.message);
      return;
    }

    setLeaveTypes(typesData ?? []);
    setLeaves(leavesData ?? []);
  }, [userId, currentYearRange.from, currentYearRange.to]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const stats: LeaveTypeStats[] = useMemo(() => {
    const byType: Record<
      number,
      { approved: number; pending: number; rejected: number }
    > = {};

    for (const lv of leaves) {
      if (!lv.leave_type_id) continue;

      const days = getLeaveDays(lv);
      const typeId = Number(lv.leave_type_id);
      const bucket = (byType[typeId] ??= {
        approved: 0,
        pending: 0,
        rejected: 0,
      });

      const status = String(lv.status ?? "").toLowerCase();
      if (status === "approved") bucket.approved += days;
      else if (status === "pending") bucket.pending += days;
      else if (status === "rejected") bucket.rejected += days;
    }

    return leaveTypes.map((t) => {
      const limit = t.leave_limit ?? 0;
      const sums = byType[t.id] ?? { approved: 0, pending: 0, rejected: 0 };
      const remaining = Math.max(0, limit - sums.approved - sums.pending);

      return {
        leaveTypeId: t.id,
        name: t.name ?? "Unnamed",
        limit,
        approved: sums.approved,
        pending: sums.pending,
        rejected: sums.rejected,
        remaining,
      };
    });
  }, [leaveTypes, leaves]);

  if (!userId) {
    return (
      <View style={tw`flex-1 items-center justify-center p-4`}>
        <Text style={tw`text-slate-600`}>
          Please sign in to view leave details.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator />
        <Text style={tw`mt-2 text-slate-600`}>Loading leave details…</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`px-4 pb-2`}>
        {/* <Text style={tw`text-xl font-semibold text-slate-900`}>
          Leave Details
        </Text> */}
        {error ? (
          <Text style={tw`mt-2 text-red-600`}>Error: {error}</Text>
        ) : null}
      </View>

      <FlatList
        data={stats}
        keyExtractor={(item) => String(item.leaveTypeId)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={tw`p-4 pb-6`}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        renderItem={({ item }) => (
          <View style={tw`rounded-2xl border border-slate-200 bg-slate-50 p-4`}>
            <View style={tw`flex-row items-center justify-between`}>
              <Text style={tw`text-base font-semibold text-slate-900`}>
                {item.name}
              </Text>
              <Text style={tw`text-sm text-slate-600`}>
                Remaining:{" "}
                <Text style={tw`font-semibold`}>
                  {formatDays(item.remaining)}
                </Text>
              </Text>
            </View>

            <View style={tw`mt-3 flex-row justify-between`}>
              <View>
                <Text style={tw`text-xs text-slate-500`}>Approved</Text>
                <Text style={tw`text-base font-semibold text-slate-900`}>
                  {formatDays(item.approved)}
                </Text>
              </View>

              <View>
                <Text style={tw`text-xs text-slate-500`}>Pending</Text>
                <Text style={tw`text-base font-semibold text-slate-900`}>
                  {formatDays(item.pending)}
                </Text>
              </View>

              <View>
                <Text style={tw`text-xs text-slate-500`}>Rejected</Text>
                <Text style={tw`text-base font-semibold text-slate-900`}>
                  {formatDays(item.rejected)}
                </Text>
              </View>

              <View>
                <Text style={tw`text-xs text-slate-500`}>Limit</Text>
                <Text style={tw`text-base font-semibold text-slate-900`}>
                  {formatDays(item.limit)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={tw`items-center justify-center py-12`}>
            <Text style={tw`text-slate-600`}>No leave types found.</Text>
          </View>
        }
      />
    </View>
  );
}
