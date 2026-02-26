import { Leave, LeaveStatus, updateLeaveStatus } from "@/src/services/leave.service";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

import { useAuthStore } from "@/src/store/useAuthStore";
import { useLeaveStore } from "@/src/store/useLeaveStore";
import { useState } from "react";
import tw from "twrnc";

type Props = {
  leave: Leave;
  onStatusChange?: (status: LeaveStatus) => void;
};

export default function LeaveDetailView({ leave, onStatusChange }: Props) {
  const { user } = useAuthStore();
  const UserId = user?.id;
  const { updateLeaveStatus: updateStoreLeaveStatus } = useLeaveStore();

  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: LeaveStatus) => {
    if (!UserId) return;
    setLoading(true);
    try {
      await updateLeaveStatus(leave.id, status, UserId);
      updateStoreLeaveStatus(leave.id, status);
      onStatusChange?.(status);
    } finally {
      setLoading(false);
    }
  };

  if (!leave) return null;

  return (
    <ScrollView style={tw`flex-1 bg-white p-4`}>
      <Text style={tw`text-lg font-bold mb-2`}>{leave.first_name} {leave.last_name}</Text>
      <Text style={tw`mb-2`}>Type: {leave.leave_type_name}</Text>
      <Text style={tw`mb-2`}>From: {leave.start_date}</Text>
      <Text style={tw`mb-2`}>To: {leave.end_date}</Text>
      <Text style={tw`mb-2`}>Status: {leave.status}</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <View style={tw`flex-row mt-4 gap-3`}>
          <Pressable
            style={tw`flex-1 bg-red-500 py-3 rounded-xl`}
            onPress={() => handleStatusChange("rejected")}
          >
            <Text style={tw`text-white text-center font-bold`}>Reject</Text>
          </Pressable>

          <Pressable
            style={tw`flex-1 bg-green-600 py-3 rounded-xl`}
            onPress={() => handleStatusChange("approved")}
          >
            <Text style={tw`text-white text-center font-bold`}>Approve</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}