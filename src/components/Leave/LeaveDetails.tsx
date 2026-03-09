// components/Leave/LeaveDetails.tsx

import { Leave, LeaveStatus, fetchLeaveById, sumUserLeaveDaysByType, updateLeaveStatus } from "@/src/services/leave.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, XCircle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import tw from "twrnc";

// Label + Value helper
function LabelValue({ label, value, labelStyle, valueStyle, containerStyle }: any) {
  return (
    <View style={[{ paddingVertical: 12 }, containerStyle]}>
      <Text style={[tw`text-sm`, { color: "#6b7280" }, labelStyle]}>{label}</Text>
      <Text style={[tw`text-sm font-semibold`, { color: "#111827" }, valueStyle]}>{value}</Text>
    </View>
  );
}

// Status styling config
const statusConfig: Record<LeaveStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
  approved: { bg: "#dcfce7", text: "#16a34a", label: "APPROVED" },
  rejected: { bg: "#fee2e2", text: "#ef4444", label: "REJECTED" },
};

export default function LeaveDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const UserId = user?.id;
  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();

  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Load leave data
  useEffect(() => {
    if (!id) return;
    const loadLeave = async () => {
      try {
        const leaveData = await fetchLeaveById(id as string);
        const safeLeave: Leave = {
          ...leaveData,
          status: leaveData.status ?? "pending",
          reason: leaveData.reason ?? "N/A",
        };
        setLeave(safeLeave);
        if (safeLeave.leave_type_id) {
          const totalUsed = await sumUserLeaveDaysByType(safeLeave.user_id, safeLeave.leave_type_id);
          setUsedDays(totalUsed);
          setRemainingDays(Math.max(safeLeave.leave_limit - totalUsed, 0));
        }
      } catch {
        Alert.alert("Error", "Failed to load leave details");
      } finally {
        setLoading(false);
      }
    };
    loadLeave();
  }, [id]);
  // Handle approve/reject
  const handleStatusChange = async (newStatus: LeaveStatus) => {
    if (!leave || !UserId) return;
    try {
      if (newStatus === "approved" && leave.leave_type_id) {
        const totalUsed = await sumUserLeaveDaysByType(leave.user_id, leave.leave_type_id);
        if (totalUsed >= leave.leave_limit) {
          Alert.alert("Limit Reached", `${leave.leave_type_name} leave limit reached`);
          return;
        }
      }
      await updateLeaveStatus(leave.id, newStatus, UserId);
      updateStoreLeaveStatus(leave.id, newStatus);
      setLeave({ ...leave, status: newStatus, ...(newStatus !== "pending" && { action_taken_by: UserId }) });
      // Navigate to appropriate page based on status
      const pageMap = { approved: "approved-details", rejected: "rejected-details", pending: "leave-details" };
      router.replace({ pathname: `/(users)/more/supervisor-settings/leave/${pageMap[newStatus]}`, params: { id: leave.id } } as any);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Failed to update leave status");
    }
  };

  const isDisabled = remainingDays !== null && remainingDays <= 0;

  if (loading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator color="#000" />
      </View>
    );
  }
  if (!leave) return <Text style={tw`p-4 text-red-500`}>Leave not found</Text>;

  const cfg = statusConfig[leave.status as LeaveStatus] ?? statusConfig.pending;

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-32`}>
        {/* Header Card */}
        <View style={tw`mx-5 mt-5 rounded-3xl bg-slate-50 border border-slate-100 px-5 py-6 items-center`}>
          <Text style={tw`text-lg font-bold text-slate-900`}>{leave.first_name} {leave.last_name}</Text>
          <Text style={tw`text-sm text-slate-400 mt-0.5`}>{leave.leave_type_name ?? "Leave Request"}</Text>
          <View style={[tw`mt-3 px-4 py-1.5 rounded-full`, { backgroundColor: cfg.bg }]}>
            <Text style={[tw`text-xs font-bold`, { color: cfg.text }]}>{cfg.label}</Text>
          </View>

          <View style={tw`mt-4 flex-row gap-4`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-900`}>{leave.days_count ?? 0}</Text>
              <Text style={tw`text-xs text-slate-400`}>Days</Text>
            </View>
            {remainingDays !== null && (
              <>
                <View style={tw`w-px bg-slate-200`} />
                <View style={tw`items-center`}>
                  <Text style={[tw`text-lg font-bold`, remainingDays <= 0 ? tw`text-red-500` : tw`text-emerald-600`]}>{remainingDays}</Text>
                  <Text style={tw`text-xs text-slate-400`}>Remaining</Text>
                </View>
              </>
            )}
            <View style={tw`w-px bg-slate-200`} />
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-900`}>{leave.leave_limit}</Text>
              <Text style={tw`text-xs text-slate-400`}>Limit</Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={tw`px-5 mt-6 border-t border-slate-100`}>
          <LabelValue label="Start Date" value={leave.start_date ?? "N/A"} />
          <LabelValue label="End Date" value={leave.end_date ?? "N/A"} />
          <LabelValue label="Duration" value={`${leave.days_count ?? 0} days`} />
          <LabelValue label="Reason" value={leave.reason ?? "N/A"} />
        </View>

        {/* Leave Balance */}
        {usedDays !== null && remainingDays !== null && (
          <View style={tw`px-5 mt-6`}>
            <LabelValue label="Used" value={`${usedDays} days`} valueStyle={{ color: "#ef4444" }} />
            <LabelValue label="Remaining" value={`${remainingDays} days`} valueStyle={{ color: remainingDays <= 0 ? "#ef4444" : "#16a34a" }} />
            <LabelValue label="Limit" value={`${leave.leave_limit} days`} />
          </View>
        )}

        {isDisabled && <Text style={tw`text-xs text-red-400 px-5 mt-4`}>⚠️ Leave limit reached — approval disabled.</Text>}
      </ScrollView>

      {/* Action Buttons (visible for all users) */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 flex-row gap-3`}>
        <Pressable onPress={() => handleStatusChange("rejected")} style={({ pressed }) => [tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl border border-slate-200`, pressed && tw`opacity-70`]}>
          <XCircle size={18} color="#ef4444" />
          <Text style={tw`text-red-500 font-bold ml-2`}>Reject</Text>
        </Pressable>

        <Pressable onPress={() => handleStatusChange("approved")} disabled={isDisabled} style={({ pressed }) => [tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl`, isDisabled ? tw`bg-slate-100` : tw`bg-blue-600`, pressed && !isDisabled && tw`opacity-85`]}>
          <CheckCircle size={18} color={isDisabled ? "#94a3b8" : "#ffffff"} />
          <Text style={[tw`font-bold ml-2`, isDisabled ? tw`text-slate-400` : tw`text-white`]}>Approve</Text>
        </Pressable>
      </View>
    </View>
  );
}