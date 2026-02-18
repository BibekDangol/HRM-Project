import { useRouter } from "expo-router";
import { CalendarDays, Eye, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";

import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";

interface Props {
  visible: boolean;
}

type LeaveRow = {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string;
  leave_type?: { id: string; name: string } | null;
};

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusChipStyle(status: string) {
  const s = String(status).toLowerCase();
  if (s === "approved") return tw`bg-green-600`;
  if (s === "pending") return tw`bg-amber-500`;
  if (s === "rejected") return tw`bg-red-600`;
  return tw`bg-slate-500`;
}

export default function LeaveIndexScreen({ visible }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRow | null>(null);

  const canUse = !!user?.id;

  const COL = {
    type: { flex: 0.9, paddingRight: 12 },
    date: { flex: 1.6, alignItems: "center" as const },
    status: { flex: 1.8, alignItems: "center" as const }, // ⬅️ wider
    action: { flex: 0.9, alignItems: "center" as const },
  };

  const load = useCallback(async () => {
    if (!user?.id) {
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("leaves")
        .select(
          "id,user_id,status,created_at,leave_type:leave_type_id(id,name)",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRows((data ?? []) as LeaveRow[]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load leaves.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const openLeave = (item: LeaveRow) => setSelectedLeave(item);
  const isPending = selectedLeave?.status?.toLowerCase() === "pending";

  const goToEdit = () => {
    if (!selectedLeave) return;
    router.push({
      pathname: "/(users)/leaves/edit",
      params: { id: selectedLeave.id },
    });
    setSelectedLeave(null);
  };

  const cancelLeave = async () => {
    if (!selectedLeave || !user?.id) return;

    if (selectedLeave.status?.toLowerCase() !== "pending") {
      Alert.alert("Not allowed", "Only pending leaves can be cancelled.");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("leaves")
        .update({ status: "cancelled" })
        .eq("id", selectedLeave.id)
        .eq("user_id", user.id);

      if (error) throw error;

      Alert.alert("Cancelled", "Leave request cancelled.");
      setSelectedLeave(null);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to cancel leave.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={tw`flex-1 bg-white`}>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View
          style={[
            tw`px-5 pb-3 flex-row items-center justify-between`,
            { paddingTop: Platform.select({ ios: 10, android: 14 }) },
          ]}
        >
          <View>
            <Text style={tw`text-2xl font-bold text-slate-900 tracking-tight`}>
              My Leaves
            </Text>
            <Text style={tw`text-xs text-slate-400 mt-0.5`}>
              {new Date().getFullYear()} overview
            </Text>
          </View>

          <Pressable
            disabled={!canUse}
            onPress={() => router.replace("/(users)/leaves/calendar")}
            style={({ pressed }) => [
              tw`h-11 w-11 rounded-2xl items-center justify-center bg-blue-600`,
              pressed && tw`opacity-85`,
              !canUse && tw`opacity-40`,
            ]}
          >
            <Plus color="white" size={20} strokeWidth={2.5} />
          </Pressable>
        </View>

        {/* Table Header */}
        <View
          style={tw`mx-4 mb-2 rounded-2xl bg-slate-50 px-4 py-3 flex-row items-center`}
        >
          <View style={COL.type}>
            <Text
              style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}
            >
              Type
            </Text>
          </View>
          <View style={COL.date}>
            <Text
              style={[
                tw`text-xs font-bold text-slate-400 uppercase tracking-wider`,
                { textAlign: "center" },
              ]}
            >
              Date
            </Text>
          </View>
          <View style={COL.status}>
            <Text
              style={[
                tw`text-xs font-bold text-slate-400 uppercase tracking-wider`,
                { textAlign: "center" },
              ]}
            >
              Status
            </Text>
          </View>
          <View style={COL.action}>
            <Text
              style={[
                tw`text-xs font-bold text-slate-400 uppercase tracking-wider`,
                { textAlign: "center" },
              ]}
            >
              Action
            </Text>
          </View>
        </View>

        {loading ? (
          <View style={tw`flex-1 items-center justify-center`}>
            <ActivityIndicator color="#2563eb" />
            <Text style={tw`mt-3 text-slate-400 text-sm`}>
              Loading leaves...
            </Text>
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: insets.bottom + 16,
            }}
            ItemSeparatorComponent={() => <View style={tw`h-2`} />}
            ListEmptyComponent={
              <View style={tw`items-center justify-center py-20`}>
                <View
                  style={tw`h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4`}
                >
                  <CalendarDays size={28} color="#94a3b8" />
                </View>
                <Text style={tw`text-slate-700 font-semibold text-base`}>
                  No leave requests
                </Text>
                <Text style={tw`text-slate-400 text-sm mt-1`}>
                  Tap + to apply for leave
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View
                style={tw`flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-3.5`}
              >
                {/* Type */}
                <View style={COL.type}>
                  <Text
                    style={tw`text-sm font-semibold text-slate-900`}
                    numberOfLines={1}
                  >
                    {item.leave_type?.name ?? "Unknown"}
                  </Text>
                  {/* <Text style={tw`text-xs text-slate-400 mt-0.5`} numberOfLines={1}>
                  {item.day_type ?? "Full day"}
                </Text> */}
                </View>

                {/* Date */}
                <View style={COL.date}>
                  <Text
                    style={[
                      tw`text-sm text-slate-600 font-medium`,
                      { textAlign: "center" },
                    ]}
                    numberOfLines={1}
                  >
                    {formatDateShort(item.created_at)}
                  </Text>
                </View>

                {/* Status */}
                <View style={COL.status}>
                  <View
                    style={[
                      tw`px-3 py-1.5 rounded-xl self-center`,
                      statusChipStyle(item.status),
                    ]}
                  >
                    <Text
                      style={tw`text-white text-xs font-bold`}
                      numberOfLines={1}
                    >
                      {String(item.status).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Action */}
                <View style={COL.action}>
                  <Pressable
                    onPress={() => openLeave(item)}
                    hitSlop={10}
                    style={({ pressed }) => [
                      tw`h-9 w-9 rounded-xl bg-slate-100 items-center justify-center self-center`,
                      pressed && tw`opacity-70`,
                    ]}
                  >
                    <Eye size={16} color="#475569" />
                  </Pressable>
                </View>
              </View>
            )}
          />
        )}
      </KeyboardAvoidingView>

      {/* Bottom Sheet */}
      {selectedLeave && (
        <>
          <Pressable
            style={tw`absolute inset-0 bg-black/50`}
            onPress={() => setSelectedLeave(null)}
          />

          <View
            style={[
              tw`absolute left-0 right-0 bg-white rounded-t-3xl`,
              { paddingBottom: insets.bottom + 16, bottom: 0 },
            ]}
          >
            {/* Sheet Handle */}
            <View style={tw`items-center pt-3 pb-2`}>
              <View style={tw`h-1 w-10 rounded-full bg-slate-200`} />
            </View>

            <View style={tw`px-6 pt-2 pb-4`}>
              <Text style={tw`text-2xl font-bold text-slate-900 mb-5`}>
                Leave Details
              </Text>

              {/* Detail Cards */}
              <View style={tw`bg-slate-50 rounded-2xl p-4 gap-3 mb-5`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-sm text-slate-500`}>Type</Text>
                  <Text style={tw`text-sm font-semibold text-slate-900`}>
                    {selectedLeave.leave_type?.name ?? "Unknown type"}
                  </Text>
                </View>

                <View style={tw`h-px bg-slate-200`} />

                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-sm text-slate-500`}>Date</Text>
                  <Text style={tw`text-sm font-semibold text-slate-900`}>
                    {formatDateShort(selectedLeave.created_at)}
                  </Text>
                </View>

                <View style={tw`h-px bg-slate-200`} />

                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-sm text-slate-500`}>Status</Text>
                  <View
                    style={[
                      tw`px-3 py-1 rounded-xl`,
                      statusChipStyle(selectedLeave.status),
                    ]}
                  >
                    <Text style={tw`text-white text-xs font-bold`}>
                      {String(selectedLeave.status).toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              {isPending ? (
                <View style={tw`flex-row gap-3`}>
                  <Pressable
                    onPress={() => setSelectedLeave(null)}
                    style={({ pressed }) => [
                      tw`flex-1 border border-slate-200 py-3.5 rounded-2xl items-center`,
                      pressed && tw`opacity-80`,
                    ]}
                  >
                    <Text style={tw`text-slate-700 font-semibold`}>Cancel</Text>
                  </Pressable>

                  <Pressable
                    onPress={goToEdit}
                    style={({ pressed }) => [
                      tw`flex-1 bg-blue-600 py-3.5 rounded-2xl items-center`,
                      pressed && tw`opacity-85`,
                    ]}
                  >
                    <Text style={tw`text-white font-semibold`}>Edit</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => setSelectedLeave(null)}
                  style={({ pressed }) => [
                    tw`bg-blue-600 py-3.5 rounded-2xl items-center`,
                    pressed && tw`opacity-85`,
                  ]}
                >
                  <Text style={tw`text-white font-semibold`}>Close</Text>
                </Pressable>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}
