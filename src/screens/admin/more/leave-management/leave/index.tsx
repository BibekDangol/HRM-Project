import { CalendarClock, ChevronRight } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { LeaveStatus, fetchLeaveRequests } from "@/src/services/leave.service";
import { useCallback, useEffect, useState } from "react";

import LoadingIndicator from "@/src/components/LoadingIndicator";
import tw from "twrnc";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useRouter } from "expo-router";
import { useUsersStore } from "@/src/store/useUsersStore";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> =
  {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      dot: "bg-amber-400",
    },
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-400",
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-500",
      dot: "bg-red-400",
    },
  };

export default function LeaveRequests() {
  const { userProfile } = useUsersStore();
  const [refreshing, setRefreshing] = useState(false);
  const { setLeaves, leaves } = useLeaveStore();
  const [activeTab, setActiveTab] = useState<LeaveStatus>("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const filteredLeaves = leaves.filter((leave) => leave.status === activeTab);
  const loadLeaves = useCallback(async () => {
    if (!userProfile) return;
    try {
      const data = await fetchLeaveRequests(userProfile.organization_id);
      setLeaves(data);
    } catch (error) {
      console.log("Error loading leaves:", error);
    } finally {
      setLoading(false);
    }
  }, [userProfile, setLeaves]);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaves();
    setRefreshing(false);
  };

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const goToDetails = (leave: any) => {
    if (leave.status === "approved") {
      router.push({
        pathname: "/(admin)/leave/approved-details",
        params: { id: leave.id },
      });
    } else if (leave.status === "pending") {
      router.push({
        pathname: "/(admin)/leave/leave-details",
        params: { id: leave.id },
      });
    } else {
      router.push({
        pathname: "/(admin)/leave/rejected-details",
        params: { id: leave.id },
      });
    }
  };
  // if (loading) return <ActivityIndicator size="large" color="#00ff00" />;
  return (
    <View style={tw`flex-1 bg-white`}>
      {/* Top Tabs */}
      <View style={tw`flex-row mx-5 mt-4 bg-slate-100 rounded-2xl p-1`}>
        {(["pending", "approved", "rejected"] as LeaveStatus[]).map((tab) => {
          const isActive = activeTab === tab;

          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                tw`flex-1 py-3 rounded-xl items-center`,
                isActive ? tw`bg-white` : null,
              ]}
            >
              <Text
                style={[
                  tw`text-sm font-bold`,
                  isActive ? tw`text-blue-600` : tw`text-slate-500`,
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pt-3 pb-10`}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item: leave }) => {
          const cfg = statusConfig[leave.status] ?? statusConfig.pending;

          return (
            <Pressable
              onPress={() => goToDetails(leave)}
              style={({ pressed }) => [
                tw`flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-4`,
                pressed && tw`bg-slate-50`,
              ]}
            >
              {/* Icon */}
              <View
                style={tw`h-11 w-11 rounded-xl bg-slate-100 items-center justify-center mr-4`}
              >
                <CalendarClock size={20} color="#475569" />
              </View>

              {/* Info */}
              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-semibold text-slate-900`}>
                  {leave.first_name} {leave.last_name ?? ""}
                </Text>
                <Text style={tw`text-xs text-slate-400 mt-0.5`}>
                  {leave.start_date}
                  {leave.end_date && leave.end_date !== leave.start_date
                    ? ` → ${leave.end_date}`
                    : ""}
                </Text>
              </View>

              {/* Status Badge */}
              <View
                style={tw`flex-row items-center ${cfg.bg} px-3 py-1.5 rounded-xl mr-3`}
              >
                <View style={tw`h-1.5 w-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                <Text style={tw`text-xs font-bold ${cfg.text}`}>
                  {String(leave.status).toUpperCase()}
                </Text>
              </View>
              <ChevronRight size={16} color="#cbd5e1" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={tw`items-center justify-center py-20`}>
              <LoadingIndicator/>
            </View>
          ) : (
            <View style={tw`items-center justify-center py-20`}>
              <View
                style={tw`h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4`}
              >
                <CalendarClock size={28} color="#94a3b8" />
              </View>
              <Text style={tw`text-slate-700 font-semibold text-base`}>
                No leave requests
              </Text>
              <Text style={tw`text-slate-400 text-sm mt-1`}>
                All leave requests will appear here
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}
