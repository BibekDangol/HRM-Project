import {
  Leave,
  LeaveStatus,
  fetchLeaveById,
  sumUserLeaveDaysByType,
  updateLeaveStatus,
} from "@/src/services/leave.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, ActivityIndicator } from "react-native";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { CheckCircle, XCircle } from "lucide-react-native";
import tw from "twrnc";

function Row({ label, value, valueColor }: { label: string; value: string | number; valueColor?: string }) {
  return (
    <View style={tw`flex-row items-center justify-between py-3.5 border-b border-slate-100`}>
      <Text style={tw`text-sm text-slate-500`}>{label}</Text>
      <Text style={[tw`text-sm font-semibold text-slate-900`, valueColor ? { color: valueColor } : null]}>
        {value}
      </Text>
    </View>
  );
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending:  { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
  approved: { bg: "#dcfce7", text: "#16a34a", label: "APPROVED" },
  rejected: { bg: "#fee2e2", text: "#ef4444", label: "REJECTED" },
};

export default function LeaveDetailScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();
  const router = useRouter();

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
          const totalUsed = await sumUserLeaveDaysByType(
            safeLeave.user_id,
            safeLeave.leave_type_id,
          );
          setUsedDays(totalUsed);
          const remaining = safeLeave.leave_limit - totalUsed;
          setRemainingDays(remaining >= 0 ? remaining : 0);
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load leave data");
      } finally {
        setLoading(false);
      }
    };
    loadLeave();
  }, [id]);

  const handleStatusChange = async (status: LeaveStatus) => {
    if (!leave) return;
    try {
      if (status === "approved" && leave.leave_type_id) {
        const totalUsed = await sumUserLeaveDaysByType(leave.user_id, leave.leave_type_id);
        if (totalUsed >= leave.leave_limit) {
          Alert.alert("Limit Reached", `${leave.leave_type_name} leave limit reached for this user`);
          return;
        }
      }
      await updateLeaveStatus(leave.id, status);
      updateStoreLeaveStatus(leave.id, status);
      setLeave({ ...leave, status });
      if (status === "approved") {
        router.push({ pathname: "/(admin)/leave/leave-approved", params: { id } });
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update leave status");
    }
  };

  const isDisabled = remainingDays !== null && remainingDays <= 0;

  if (loading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }

  if (!leave) return null;

  const cfg = statusConfig[leave.status] ?? statusConfig.pending;

  // Initials
  const initials = `${leave.first_name?.[0] ?? ""}${leave.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-32`}>

        {/* Profile Card */}
        <View style={tw`mx-5 mt-5 rounded-3xl bg-slate-50 border border-slate-100 px-5 py-6 items-center`}>
          {/* Avatar */}
          <View style={tw`h-16 w-16 rounded-full bg-blue-100 items-center justify-center mb-3`}>
            <Text style={tw`text-xl font-bold text-blue-600`}>{initials}</Text>
          </View>

          {/* Name */}
          <Text style={tw`text-lg font-bold text-slate-900`}>
            {leave.first_name} {leave.last_name}
          </Text>

          {/* Leave type */}
          <Text style={tw`text-sm text-slate-400 mt-0.5`}>
            {leave.leave_type_name ?? "Leave Request"}
          </Text>

          {/* Status Badge */}
          <View style={[tw`mt-3 px-4 py-1.5 rounded-full`, { backgroundColor: cfg.bg }]}>
            <Text style={[tw`text-xs font-bold`, { color: cfg.text }]}>
              {cfg.label}
            </Text>
          </View>

          {/* Duration pill */}
          <View style={tw`mt-4 flex-row gap-4`}>
            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-900`}>
                {leave.days_count ?? 0}
              </Text>
              <Text style={tw`text-xs text-slate-400`}>Days</Text>
            </View>

            <View style={tw`w-px bg-slate-200`} />

            {remainingDays !== null && (
              <View style={tw`items-center`}>
                <Text style={[tw`text-lg font-bold`, remainingDays <= 0 ? tw`text-red-500` : tw`text-emerald-600`]}>
                  {remainingDays}
                </Text>
                <Text style={tw`text-xs text-slate-400`}>Remaining</Text>
              </View>
            )}

            <View style={tw`w-px bg-slate-200`} />

            <View style={tw`items-center`}>
              <Text style={tw`text-lg font-bold text-slate-900`}>
                {leave.leave_limit}
              </Text>
              <Text style={tw`text-xs text-slate-400`}>Limit</Text>
            </View>
          </View>
        </View>

        {/* Details Rows */}
        <View style={tw`px-5 mt-6`}>
          <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-1`}>
            Details
          </Text>
          <Row label="Start Date" value={leave.start_date ?? "N/A"} />
          <Row label="End Date" value={leave.end_date ?? "N/A"} />
          <Row label="Duration" value={`${leave.days_count ?? 0} days`} />
          <Row label="Reason" value={leave.reason ?? "N/A"} />
        </View>

        {/* Balance Rows */}
        {usedDays !== null && remainingDays !== null && (
          <View style={tw`px-5 mt-6`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-1`}>
              Leave Balance
            </Text>
            <Row label="Limit" value={`${leave.leave_limit} days`} />
            <Row label="Used" value={`${usedDays} days`} />
            <Row
              label="Remaining"
              value={`${remainingDays} days`}
              valueColor={remainingDays <= 0 ? "#ef4444" : "#16a34a"}
            />
          </View>
        )}

        {isDisabled && (
          <Text style={tw`text-xs text-red-400 px-5 mt-4`}>
            ⚠️ Leave limit reached — approval is disabled.
          </Text>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4 flex-row gap-3`}>
        <Pressable
          onPress={() => handleStatusChange("rejected")}
          style={({ pressed }) => [
            tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl border border-slate-200`,
            pressed && tw`opacity-70`,
          ]}
        >
          <XCircle size={18} color="#ef4444" />
          <Text style={tw`text-red-500 font-bold ml-2`}>Reject</Text>
        </Pressable>

        <Pressable
          onPress={() => handleStatusChange("approved")}
          disabled={isDisabled}
          style={({ pressed }) => [
            tw`flex-1 flex-row items-center justify-center py-4 rounded-2xl`,
            isDisabled ? tw`bg-slate-100` : tw`bg-blue-600`,
            pressed && !isDisabled && tw`opacity-85`,
          ]}
        >
          <CheckCircle size={18} color={isDisabled ? "#94a3b8" : "#ffffff"} />
          <Text style={[tw`font-bold ml-2`, isDisabled ? tw`text-slate-400` : tw`text-white`]}>
            Approve
          </Text>
        </Pressable>
      </View>
    </View>
  );
}