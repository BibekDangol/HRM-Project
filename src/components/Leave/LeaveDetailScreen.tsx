import { colors } from "@/theme/colors";
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
import tw from "@/theme/tw";

export type LeaveDetailScreenProps = {
  role?: "admin" | "supervisor";
  expectedStatus?: LeaveStatus;
};

const STATUS_CONFIG = {
  pending: { bg: colors.accentSoft, text: colors.warning, label: "PENDING" },
  approved: { bg: colors.successSoft, text: colors.success, label: "APPROVED" },
  rejected: { bg: colors.dangerSoft, text: colors.danger, label: "REJECTED" },
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
      <View style={tw`flex-1 bg-canvas items-center justify-center p-6`}>
        <EmptyState
          icon={<CalendarX size={36} color={colors.subtle} />}
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
