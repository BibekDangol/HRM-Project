import { Pressable, FlatList, Text, View } from "react-native";

import { fetchLeaveRequests } from "@/src/services/leave.service";
import { useUsersStore } from "@/src/store/useAdminsStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { CalendarClock, ChevronRight } from "lucide-react-native";
import tw from "twrnc";

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
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
  const { adminProfile } = useUsersStore();
  const { setLeaves, leaves } = useLeaveStore();
  const router = useRouter();

  useEffect(() => {
    if (!adminProfile) return;
    const loadLeaves = async () => {
      const data = await fetchLeaveRequests(adminProfile.organization_id);
      setLeaves(data);
    };
    loadLeaves();
  }, [adminProfile, setLeaves]);

  const goToDetails = (leave: any) => {
    if (leave.status === "approved") {
      router.push({ pathname: "/(admin)/leave/approved-details", params: { id: leave.id } });
    } else if (leave.status === "pending") {
      router.push({ pathname: "/(admin)/leave/leave-details", params: { id: leave.id } });
    } else {
      router.push({ pathname: "/(admin)/leave/rejected-details", params: { id: leave.id } });
    }
  };

  return (
    <View style={tw`flex-1 bg-white`}>
      <FlatList
        data={leaves ?? []}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={tw`px-4 pt-3 pb-10`}
        ItemSeparatorComponent={() => <View style={tw`h-3`} />}
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
              <View style={tw`h-11 w-11 rounded-xl bg-slate-100 items-center justify-center mr-4`}>
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
              <View style={tw`flex-row items-center ${cfg.bg} px-3 py-1.5 rounded-xl mr-3`}>
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
          <View style={tw`items-center justify-center py-20`}>
            <View style={tw`h-16 w-16 rounded-full bg-slate-100 items-center justify-center mb-4`}>
              <CalendarClock size={28} color="#94a3b8" />
            </View>
            <Text style={tw`text-slate-700 font-semibold text-base`}>
              No leave requests
            </Text>
            <Text style={tw`text-slate-400 text-sm mt-1`}>
              All leave requests will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}