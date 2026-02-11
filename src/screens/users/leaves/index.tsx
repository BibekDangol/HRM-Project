import { useRouter } from "expo-router";
import { Eye, Pencil, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import tw from "twrnc";

import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";

type LeaveRow = {
  id: string;
  user_id: string;
  // subject: string;
  status: "pending" | "approved" | "rejected" | string;
  created_at: string; // ISO
  leave_type?: { id: string; name: string } | null;
};

function formatDateShort(iso: string) {
  const d = new Date(iso);
  // mobile-friendly short date
  return d.toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function statusChipStyle(status: string) {
  const s = status.toLowerCase();
  if (s === "approved") return tw`bg-green-600`;
  if (s === "pending") return tw`bg-amber-500`;
  if (s === "rejected") return tw`bg-red-600`;
  return tw`bg-slate-500`;
}

export default function LeaveIndexScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rows, setRows] = useState<LeaveRow[]>([]);

  const canUse = !!user?.id;

  const load = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("leaves")
        .select(
          `
    id,
    user_id,
    status,
    created_at,
    leave_type:leave_type_id (
      id,
      name
    )
  `,
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRows((data ?? []) as LeaveRow[]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load leaves.");
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

  // const empty = useMemo(() => {
  //   if (loading) return null;
  //   return (
  //     <View style={tw`mt-10 items-center`}>
  //       <Text style={tw`text-slate-500`}>No leave requests yet.</Text>
  //       <Pressable
  //         onPress={() => router.replace("/(users)/leaves")}
  //         style={tw`mt-4 px-4 py-3 rounded-2xl bg-slate-900`}
  //       >
  //         <Text style={tw`text-white font-semibold`}>Apply for Leave</Text>
  //       </Pressable>
  //     </View>
  //   );
  // }, [loading, router]);

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`px-4 pt-4 pb-2 flex-row items-center justify-between`}>
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

        <Text style={tw`w-32 text-xs font-semibold text-slate-500 text-center`}>
          Date
        </Text>

        <Text style={tw`w-28 text-xs font-semibold text-slate-500 text-center`}>
          Status
        </Text>

        <Text style={tw`w-20 text-xs font-semibold text-slate-500 text-center`}>
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
          // ListEmptyComponent={empty}
          contentContainerStyle={tw`${rows.length === 0 ? "flex-1" : ""}`}
          renderItem={({ item }) => {
            const isPending = item.status?.toLowerCase() === "pending";

            return (
              <View style={tw`px-4 py-3 border-t border-slate-100`}>
                <View style={tw`flex-row items-center`}>
                  {/* Type */}
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

                  <View style={tw`w-24 flex-row  justify-end align-start`}>
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

                    {/* {isPending && (
                      <Pressable
                        onPress={() => router.push("/(users)/leaves/edit")}
                        style={({ pressed }) => [
                          tw`ml-2 px-3 py-2 rounded-full border border-slate-200 flex-row items-center`,
                          pressed && tw`opacity-80`,
                        ]}
                      ></Pressable>
                    )} */}
                  </View>

                  <View style={tw`w-20 items-center`}>
                    <Pressable
                      onPress={() => {
                        router.replace("/(users)/leaves/edit")
                      }}
                      style={({ pressed }) => [
                        tw`h-10 w-10 rounded-full border border-slate-200 items-center justify-center`,
                        pressed && tw`opacity-80`,
                      ]}
                    >
                      <Eye size={18} color="#0f172a" />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
