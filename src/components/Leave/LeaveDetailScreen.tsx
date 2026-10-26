import EmptyState from "@/src/components/states/EmptyState";
import { LeaveDetailCard } from "@/src/components/Leave/LeaveDetailCard";
import { LeaveStatus } from "@/src/services/leave.service";
import LoadingState from "@/src/components/states/LoadingState";
import PendingLeaveView from "@/src/components/Leave/PendingLeaveView";
import React, { useCallback } from "react";
import { useLeaveDetail } from "@/src/hooks/useLeaveDetail";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarX } from "lucide-react-native";
import { View } from "react-native";
import tw from "twrnc";

export type LeaveDetailScreenProps = {
  role?: "admin" | "supervisor";
  expectedStatus?: LeaveStatus;
};

const STATUS_CONFIG = {
  pending: { bg: "#fef3c7", text: "#d97706", label: "PENDING" },
  approved: { bg: "#dcfce7", text: "#16a34a", label: "APPROVED" },
  rejected: { bg: "#fee2e2", text: "#ef4444", label: "REJECTED" },
};

export function LeaveDetailScreen({
  role = "admin",
  expectedStatus,
}: LeaveDetailScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const leaveId = typeof params.id === "string" ? params.id : params.id?.[0];

  const handleStatusChanged = useCallback(
    (newStatus: LeaveStatus, updatedLeave: { id: string }) => {
      if (role === "admin") {
        if (newStatus === "approved") {
          router.replace({
            pathname: "/(admin)/leave/approved-details",
            params: { id: updatedLeave.id },
          });
        } else if (newStatus === "rejected") {
          router.replace({
            pathname: "/(admin)/leave/rejected-details",
            params: { id: updatedLeave.id },
          });
        }
      } else {
        if (newStatus === "approved") {
          router.replace({
            pathname: "/(users)/more/supervisor-settings/leave/approved-details",
            params: { id: updatedLeave.id },
          });
        } else if (newStatus === "rejected") {
          router.replace({
            pathname: "/(users)/more/supervisor-settings/leave/rejected-details",
            params: { id: updatedLeave.id },
          });
        }
      }
    },
    [role, router],
  );

  const {
    leave,
    usedDays,
    remainingDays,
    loading,
    handleStatusChange,
  } = useLeaveDetail({
    leaveId,
    onStatusChanged: handleStatusChanged,
  });

  if (loading) {
    return <LoadingState fullScreen message="Loading leave details..." />;
  }

  if (!leave) {
    return (
      <View style={tw`flex-1 bg-white items-center justify-center p-6`}>
        <EmptyState
          icon={<CalendarX size={36} color="#9CA3AF" />}
          title="Leave Not Found"
          message="The requested leave application could not be found."
        />
      </View>
    );
  }

  const effectiveStatus = expectedStatus ?? leave.status;

  if (effectiveStatus === "pending") {
    const cfg = STATUS_CONFIG[leave.status] ?? STATUS_CONFIG.pending;
    return (
      <PendingLeaveView
        leave={leave}
        cfg={cfg}
        usedDays={usedDays}
        remainingDays={remainingDays}
        showActions={leave.status === "pending"}
        handleStatusChange={
          handleStatusChange
            ? async (status) => {
                await handleStatusChange(status);
              }
            : undefined
        }
      />
    );
  }

  return <LeaveDetailCard leave={leave} status={effectiveStatus} />;
}

export default LeaveDetailScreen;
