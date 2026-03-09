import { ScrollView, Text, View } from "react-native";
import { useEffect, useState } from "react";

import LoadingIndicator from "@/src/components/LoadingIndicator";
import { fetchLeaveById } from "@/src/services/leave.service";
import tw from "twrnc";
import { useLocalSearchParams } from "expo-router";

export default function LeaveApprovedDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [leave, setLeave] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    const loadLeave = async () => {
      const data = await fetchLeaveById(id as string);
      setLeave(data);
      setLoading(false);
    };
    loadLeave();
  }, [id]);
  if (loading) return <LoadingIndicator message="Loading..." />
  return (
    <ScrollView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`bg-white m-4 rounded-xl p-4 shadow`}>

        {/* Header */}
        <Text style={tw`text-lg font-bold text-gray-900 mb-1`}>
          Leave Approved
        </Text>
        <Text style={tw`text-green-600 font-semibold mb-4`}>
          This leave request has been approved
        </Text>

        {/* Employee Info */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Employee Name</Text>
          <Text style={tw`text-gray-900 text-base font-semibold`}>
            {leave.first_name} {leave.last_name}
          </Text>
        </View>

        {/* Leave Type */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Leave Type</Text>
          <Text style={tw`text-gray-900`}>{leave.leave_type_name}</Text>
        </View>

        {/* Dates */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View>
            <Text style={tw`text-gray-500 text-sm`}>Start Date</Text>
            <Text style={tw`text-gray-900`}>{leave.start_date}</Text>
          </View>
          <View>
            <Text style={tw`text-gray-500 text-sm`}>End Date</Text>
            <Text style={tw`text-gray-900`}>{leave.end_date}</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Duration</Text>
          <Text style={tw`text-gray-900`}>
            {leave.day_type === "half" ? "Half Day" : "Full Day"}
          </Text>
        </View>

        {/* Reason */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Reason</Text>
          <Text style={tw`text-gray-900`}>
            {leave.reason || "N/A"}
          </Text>
        </View>

        {/* Approved Info */}
        <View style={tw`border-t border-gray-200 pt-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Status</Text>
          <Text style={tw`text-green-600 font-semibold mb-2`}>
            {leave.status.toUpperCase()}
          </Text>

          <Text style={tw`text-gray-500 text-sm`}>Approved By</Text>
          <Text style={tw`text-gray-900 mb-2`}>
            {leave.action_taken_by_first_name || "N/A"}
          </Text>

          <Text style={tw`text-gray-500 text-sm`}>Approved On</Text>
          <Text style={tw`text-gray-900`}>
            {leave?.updated_at?.split("T")[0] || "N/A"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
