import { Leave, LeaveStatus, fetchLeaveById, sumUserLeaveDaysByType, updateLeaveStatus } from "@/src/services/leave.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import InfoRow from "@/src/screens/admin/components/InfoRow";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import tw from "twrnc";

export default function LeaveDetailScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [usedDays, setUsedDays] = useState<number | null>(null);
  const [remainingDays, setRemainingDays] = useState<number | null>(null);

  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const loadLeave = async () => {
      try {
        const leaveData = await fetchLeaveById(id as string);
        // Ensure a default status if missing
        const safeLeave: Leave = {
          ...leaveData,
          status: leaveData.status ?? "pending",
          reason: leaveData.reason ?? "N/A",
        };

        setLeave(safeLeave);
        if (safeLeave.leave_type_id) {
          const totalUsed = await sumUserLeaveDaysByType(
            safeLeave.user_id,
            safeLeave.leave_type_id
          );
          setUsedDays(totalUsed);
          const remaining = safeLeave.leave_limit - totalUsed;
          setRemainingDays(remaining >= 0 ? remaining : 0);
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to load leave data");
      }
    };
    loadLeave();
  }, [id]);

  const handleStatusChange = async (status: LeaveStatus) => {
    if (!leave) return;

    try {
      if (status === "approved" && leave.leave_type_id) {
        const totalUsed = await sumUserLeaveDaysByType(
          leave.user_id,
          leave.leave_type_id
        );

        if (totalUsed >= leave.leave_limit) {
          Alert.alert(
            "Limit Reached",
            `${leave.leave_type_name} leave limit reached for this user`
          );
          return;
        }
      }

      await updateLeaveStatus(leave.id, status);

      // Update store & local state
      updateStoreLeaveStatus(leave.id, status);
      setLeave({ ...leave, status });

      if (status === "approved") {
        router.push({
          pathname: "/(admin)/leave/leave-approved",
          params: { id },
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update leave status");
    }
  };
  const isDisabled = remainingDays !== null && remainingDays <= 0;
  if (!leave) return <Text style={tw`p-4`}>Loading...</Text>;
  return (
    <ScrollView style={tw`flex-1 bg-white px-4 pt-4`}>
      <Text style={tw`text-lg font-semibold mb-2`}>
        {leave.first_name} {leave.last_name}
      </Text>

      <InfoRow
        label="Status"
        value={leave?.status?.toUpperCase()}
        badge
      />

      <View style={tw`flex-row gap-2 mt-4`}>
        <View style={tw`flex-1`}>
          <InfoRow label="Start Date" value={leave.start_date ?? "N/A"} />
        </View>
        <View style={tw`flex-1`}>
          <InfoRow label="End Date" value={leave.end_date ?? "N/A"} />
        </View>
      </View>

      <View style={tw`flex-row gap-2 mt-4`}>
        <View style={tw`flex-1`}>
          <InfoRow label="Leave Type" value={leave.leave_type_name ?? "N/A"} />
        </View>
        <View style={tw`flex-1`}>
          <InfoRow label="Duration" value={`${leave.days_count ?? 0} days`} />
        </View>
      </View>

      {usedDays !== null && remainingDays !== null && (
        <View style={tw`mt-2`}>
          <InfoRow
            label="Leave Used"
            value={`${usedDays}`}
          />
          <InfoRow
            label="Remaining days left"
            value={<Text style={tw`${isDisabled ? "text-red-300 " : "text-black"}`}>{remainingDays}</Text>}
          />
          <InfoRow
            label="Leave Limit"
            value={`${leave.leave_limit}`}
          />
        </View>
      )}

      <View style={tw`mt-4`}>
        <InfoRow label="Reason" value={leave.reason ?? "N/A"} />
      </View>

      <View style={tw`flex-row gap-3 mt-6 mb-6`}>
        <Pressable
          style={tw`flex-1 border border-gray-300 py-3 rounded-lg`}
          onPress={() => handleStatusChange("rejected")}
        >
          <Text style={tw`text-center font-semibold text-gray-700`}>Reject</Text>
        </Pressable>

        <Pressable
          style={tw`flex-1 py-3 rounded-lg ${isDisabled ? "bg-gray-200" : "bg-blue-600"}`}
          onPress={() => handleStatusChange("approved")}
          disabled={isDisabled}
        >
          <Text style={tw`text-center font-semibold text-white `}>Approve</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
