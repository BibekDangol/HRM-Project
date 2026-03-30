import {
  Leave,
  LeaveStatus,
  fetchLeaveById,
  sumUserLeaveDaysByType,
  updateLeaveStatus,
} from "@/src/services/leave.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

import AdminPendingView from "@/src/components/Leave/AdminPendingView";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import tw from "twrnc";

// Helper component: Label + Value (full control)
export function LabelValue({
  label,
  value,
  labelStyle,
  valueStyle,
  containerStyle,
}: {
  label: string;
  value: string | number;
  labelStyle?: object;
  valueStyle?: object;
  containerStyle?: object;
}) {
  return (
    <View style={[{ paddingVertical: 12 }, containerStyle]}>
      <Text style={[tw`text-sm`, { color: "#6b7280" }, labelStyle]}>
        {label}
      </Text>
      <Text
        style={[tw`text-sm font-semibold`, { color: "#111827" }, valueStyle]}
      >
        {value}
      </Text>
    </View>
  );
}

export type StatusConfigValue = { bg: string; text: string; label: string };

export type StatusConfig = Record<string, StatusConfigValue>;

const statusConfig: StatusConfig = {
  pending: { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
  approved: { bg: "#dcfce7", text: "#16a34a", label: "APPROVED" },
  rejected: { bg: "#fee2e2", text: "#ef4444", label: "REJECTED" },
};

export default function PendingDetails() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();
  const UserId = user?.id; // UUID of the logged-in admin
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
      } catch {
        Alert.alert("Error", "Failed to load leave data");
      } finally {
        setLoading(false);
      }
    };
    loadLeave();
  }, [id]);
  const handleStatusChange = async (status: LeaveStatus) => {
    if (!leave) return;
    if (!UserId) {
      Alert.alert("Error", "Current admin user ID not found");
      return;
    }
    try {
      if (status === "approved" && leave.leave_type_id) {
        const totalUsed = await sumUserLeaveDaysByType(
          leave.user_id,
          leave.leave_type_id,
        );
        if (totalUsed > leave.leave_limit) {
          Alert.alert(
            "Limit Reached",
            `${leave.leave_type_name} leave limit reached for this user`,
          );
          return;
        }
      }
      await updateLeaveStatus(leave.id, status, UserId);
      updateStoreLeaveStatus(leave.id, status);
      setLeave({
        ...leave,
        status,
        ...(status !== "pending" && { action_taken_by: UserId }),
      });
      // Navigate only if approved
      if (status === "approved") {
        router.replace({
          pathname: "/(admin)/leave/approved-details",
          params: { id: leave.id }, // pass leave ID
        });
      }
      if (status === "rejected") {
        router.replace({
          pathname: "/(admin)/leave/rejected-details",
          params: { id: leave.id }, // pass leave ID
        });
      }
    } catch (err: any) {
      console.log("Error updating leave:", err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.error || "Failed to update leave status",
      );
    }
  };
  if (loading) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center`}>
        <ActivityIndicator color="#000000" />
      </View>
    );
  }

  if (!leave) return null;

  const cfg = statusConfig[leave.status] ?? statusConfig.pending;

  return (
    <AdminPendingView
      leave={leave}
      cfg={cfg}
      handleStatusChange={handleStatusChange}
      remainingDays={remainingDays}
      usedDays={usedDays}
    />
  );
}
