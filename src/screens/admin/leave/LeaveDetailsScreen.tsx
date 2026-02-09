import { LeaveStatus, countUserLeaves, fetchLeaveById, updateLeaveStatus } from "@/src/services/leave.service";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import InfoRow from "@/src/screens/admin/components/InfoRow";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import tw from "twrnc";

export default function LeaveDetailScreen() {
  const { id } = useLocalSearchParams(); // leave id from router
  const [leave, setLeave] = useState<any>(null);
  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const loadLeave = async () => {
      const data = await fetchLeaveById(id as string);
      setLeave(data);
    };
    loadLeave();
  }, [id]);

  const handleStatusChange = async (status: LeaveStatus) => {
    if (!leave) return;
    try {
      if (status === "approved") {
        const currentCount = await countUserLeaves(leave.user_id, leave.leave_type);
        const limits: Record<string, number> = {
          annual: 3,
          sick: 10,
        };
        if (currentCount >= (limits[leave.leave_type] || Infinity)) {
          Alert.alert(
            "Limit Reached",
            `${leave.leave_type} leave limit reached for this user`
          );
          return; // stop approval
        }
      }
      await updateLeaveStatus(leave.id, status);
      updateStoreLeaveStatus(leave.id, status); // update store
      setLeave({ ...leave, status });
      if (status === "approved") {
        router.push({
          pathname: '/(admin)/leave/leave-approved',
          params: { id: id } // pass leave id
        })
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update leave status");
    }
  };

  if (!leave) return <Text style={tw`p-4`}>Loading...</Text>;

  return (
    <ScrollView style={tw`flex-1 bg-white px-4 pt-4`}>
      <Text style={tw`text-xl font-semibold mb-4`}>Leave Details</Text>

      <Text style={tw`text-lg font-semibold mb-2`}>
        {leave.first_name} {leave.last_name}
      </Text>

      {/* Status badge inline */}
      <InfoRow label="Status" value={leave.status.toUpperCase()} badge />

      {/* Dates side by side */}
      <View style={tw`flex-row gap-2 mt-4`}>
        <View style={tw`flex-1`}>
          <InfoRow label="Start Date" value={leave.start_date} />
        </View>
        <View style={tw`flex-1`}>
          <InfoRow label="End Date" value={leave.end_date} />
        </View>
      </View>

      {/* Leave type / duration */}
      <View style={tw`flex-row gap-2 mt-4`}>
        <View style={tw`flex-1`}>
          <InfoRow label="Leave Type" value={leave.leave_type} />
        </View>
        <View style={tw`flex-1`}>
          <InfoRow label="Duration" value={leave.is_half_day ? "Half day" : "Full day"} />
        </View>
      </View>

      {/* Reason */}
      <View style={tw`mt-4`}>
        <InfoRow label="Reason" value={leave.reason || "N/A"} />
      </View>

      {/* Actions */}
      <View style={tw`flex-row gap-3 mt-6 mb-6`}>
        <Pressable
          style={tw`flex-1 border border-gray-300 py-3 rounded-lg`}
          onPress={() => handleStatusChange("rejected")}
        >
          <Text style={tw`text-center font-semibold text-gray-700`}>Reject</Text>
        </Pressable>

        <Pressable
          style={tw`flex-1 bg-blue-600 py-3 rounded-lg`}
          onPress={() => handleStatusChange("approved")}
        >
          <Text style={tw`text-center font-semibold text-white`}>Approve</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
