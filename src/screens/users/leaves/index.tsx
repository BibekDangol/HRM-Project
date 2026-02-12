import { useRouter } from "expo-router";
import { Eye, Plus } from "lucide-react-native";
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
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<LeaveRow[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRow | null>(null);

  const canUse = !!user?.id;

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

  // ✅ Eye icon can open for ALL statuses
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

  // ✅ Cancel only for pending
  const cancelLeave = async () => {
    if (!selectedLeave || !user?.id) return;

    if (selectedLeave.status?.toLowerCase() !== "pending") {
      Alert.alert("Not allowed", "Only pending leaves can be cancelled.");
      return;
    }

    try {
      setLoading(true);

      // Option A: mark as cancelled (recommended)
      const { error } = await supabase
        .from("leaves")
        .update({ status: "cancelled" }) // make sure your DB accepts this value
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
    <View style={tw`flex-1`}>
      <View style={tw`flex-1 bg-white`}>
        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View
            style={tw`px-4 pt-4 pb-2 flex-row items-center justify-between`}
          >
            <Text style={tw`text-xl font-bold text-slate-900`}>My Leaves</Text>

            <Pressable
              disabled={!canUse}
              onPress={() => router.replace("/(users)/leaves/calendar")}
              style={({ pressed }) => [
                tw`h-11 w-11 rounded-full items-center justify-center bg-blue-600`,
                pressed && tw`opacity-85`,
                !canUse && tw`opacity-40`,
              ]}
            >
              <Plus color="white" size={22} />
            </Pressable>
          </View>

          {/* Table header */}
          <View style={tw`px-4 pt-2 pb-2 flex-row items-center`}>
            <Text style={tw`flex-1 text-xs font-semibold text-slate-500`}>
              Type
            </Text>
            <Text
              style={tw`w-32 text-xs font-semibold text-slate-500 text-center`}
            >
              Date
            </Text>
            <Text
              style={tw`w-28 text-xs font-semibold text-slate-500 text-center`}
            >
              Status
            </Text>
            <Text
              style={tw`w-20 text-xs font-semibold text-slate-500 text-center`}
            >
              Action
            </Text>
          </View>

          {loading ? (
            <View style={tw`flex-1 items-center justify-center`}>
              <ActivityIndicator />
              <Text style={tw`mt-2 text-slate-500`}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(item) => item.id}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListEmptyComponent={
                <View style={tw`flex-1 items-center justify-center`}>
                  <Text style={tw`text-slate-500`}>No leave requests yet.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={tw`px-4 py-3 border-t border-slate-100`}>
                  <View style={tw`flex-row items-center`}>
                    <View style={tw`flex-1 pr-3`}>
                      <Text
                        style={tw`text-base font-semibold text-slate-900`}
                        numberOfLines={1}
                      >
                        {item.leave_type?.name ?? "Unknown type"}
                      </Text>
                    </View>

                    <View style={tw`w-32 items-center`}>
                      <Text style={tw`text-sm text-slate-600`}>
                        {formatDateShort(item.created_at)}
                      </Text>
                    </View>

                    <View style={tw`w-28 items-center`}>
                      <View
                        style={[
                          tw`px-4 py-2 rounded-full`,
                          statusChipStyle(item.status),
                        ]}
                      >
                        <Text style={tw`text-white text-xs font-semibold`}>
                          {String(item.status).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={tw`w-20 items-center`}>
                      <Pressable
                        onPress={() => openLeave(item)}
                        style={({ pressed }) => [
                          tw`h-10 w-10 rounded-full border border-slate-200 items-center justify-center`,
                          pressed && tw`opacity-80`,
                        ]}
                      >
                        <Eye size={18} color={"#0f172a"} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </View>

      {/* Bottom Sheet */}
      {selectedLeave && (
        <>
          <Pressable
            style={tw`absolute inset-0 bg-black/40`}
            onPress={() => setSelectedLeave(null)}
          />

          <View
            style={tw`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6`}
          >
            <Text style={tw`text-2xl font-bold text-slate-900 mb-6`}>
              Leave Details
            </Text>

            <Text style={tw`text-base mb-3`}>
              <Text style={tw`font-semibold`}>Type: </Text>
              {selectedLeave.leave_type?.name ?? "Unknown type"}
            </Text>

            <Text style={tw`text-base mb-3`}>
              <Text style={tw`font-semibold`}>Date: </Text>
              {formatDateShort(selectedLeave.created_at)}
            </Text>

            <Text style={tw`text-base mb-6`}>
              <Text style={tw`font-semibold`}>Status: </Text>
              {String(selectedLeave.status).toUpperCase()}
            </Text>

            {isPending ? (
              <View style={tw`flex-row gap-3`}>
                <Pressable
                  onPress={() => setSelectedLeave(null)}
                  style={({ pressed }) => [
                    tw`flex-1 border border-red-200 py-3 rounded-xl items-center`,
                    pressed && tw`opacity-80`,
                  ]}
                >
                  <Text style={tw`text-red-600 font-semibold`}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={goToEdit}
                  style={({ pressed }) => [
                    tw`flex-1 bg-blue-600 py-3 rounded-xl items-center`,
                    pressed && tw`opacity-85`,
                  ]}
                >
                  <Text style={tw`text-white font-semibold`}>Edit</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setSelectedLeave(null)}
                style={tw`bg-blue-600 py-3 rounded-xl items-center`}
              >
                <Text style={tw`text-white font-semibold`}>Close</Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </View>
  );
}
