import {
  Leave,
  LeaveStatus,
  fetchLeaveById,
  sumUserLeaveDaysByType,
  updateLeaveStatus,
} from "@/src/services/leave.service";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";

export type UseLeaveDetailOptions = {
  leaveId?: string;
  onStatusChanged?: (status: LeaveStatus, leave: Leave) => void;
};

export function useLeaveDetail(options: UseLeaveDetailOptions = {}) {
  const { leaveId, onStatusChanged } = options;
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();

  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);
  const [loading, setLoading] = useState(Boolean(leaveId));
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leaveId) return;

    let cancelled = false;

    fetchLeaveById(leaveId)
      .then(async (leaveData) => {
        if (cancelled) return;
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
          if (cancelled) return;
          setUsedDays(totalUsed);
          const remaining = safeLeave.leave_limit - totalUsed;
          setRemainingDays(remaining >= 0 ? remaining : 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? "Failed to load leave data");
        setLoading(false);
        Alert.alert("Error", "Failed to load leave data");
      });

    return () => {
      cancelled = true;
    };
  }, [leaveId]);

  const handleStatusChange = useCallback(
    async (status: LeaveStatus): Promise<boolean> => {
      if (!leave) return false;
      if (!userId) {
        Alert.alert("Error", "Current user ID not found");
        return false;
      }

      try {
        setUpdating(true);
        if (status === "approved" && leave.leave_type_id) {
          const totalUsed = await sumUserLeaveDaysByType(
            leave.user_id,
            leave.leave_type_id,
          );
          if (totalUsed > leave.leave_limit) {
            Alert.alert(
              "Limit Reached",
              `${leave.leave_type_name || "Leave"} limit reached for this user`,
            );
            return false;
          }
        }

        await updateLeaveStatus(leave.id, status, userId);
        updateStoreLeaveStatus(leave.id, status);

        const updatedLeave: Leave = {
          ...leave,
          status,
          ...(status !== "pending" && { action_taken_by: userId }),
        };
        setLeave(updatedLeave);
        onStatusChanged?.(status, updatedLeave);
        return true;
      } catch (err: any) {
        console.log("Error updating leave:", err.response?.data || err.message);
        Alert.alert(
          "Error",
          err.response?.data?.error || err.message || "Failed to update leave status",
        );
        return false;
      } finally {
        setUpdating(false);
      }
    },
    [leave, userId, updateStoreLeaveStatus, onStatusChanged],
  );

  return {
    leave,
    usedDays,
    remainingDays,
    loading,
    updating,
    error,
    handleStatusChange,
  };
}

export default useLeaveDetail;
