import {
  Leave,
  fetchLeaveById,
  sumUserLeaveDaysByType,
  updateLeaveStatus,
  LeaveStatus,
} from "@/src/services/leave.service";

import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import tw from "twrnc";

import PendingLeaveView from "@/src/components/Leave/PendingLeaveView";
import { useAuthStore } from "@/src/store/useAuthStore";

const statusConfig = {
  pending: { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
  approved: { bg: "#dcfce7", text: "#16a34a", label: "APPROVED" },
  rejected: { bg: "#fee2e2", text: "#ef4444", label: "REJECTED" },
};

export default function PendingDetails() {
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();

  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

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

  // ✅ Supervisor action handler
  const handleStatusChange = async (status: LeaveStatus) => {
    if (!leave || !user?.id) return;

    try {
      await updateLeaveStatus(leave.id, status, user.id);

      setLeave({ ...leave, status });

    } catch (err) {
      Alert.alert("Error", "Failed to update leave status");
    }
  };


  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center bg-white`}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!leave) return null;

  const cfg = statusConfig[leave.status] ?? statusConfig.pending;



  return (
    <PendingLeaveView
      leave={leave}
      cfg={cfg}
      usedDays={usedDays}
      remainingDays={remainingDays}
      showActions={leave.status === "pending"}
      handleStatusChange={handleStatusChange}
    />
  );
}
