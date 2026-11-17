import { ScrollView, Text, View } from "react-native";

import { Leave } from "@/src/services/leave.service";
import tw from "@/theme/tw";

interface Props {
  leave: Leave;
}

export default function ApprovedLeaveView({ leave }: Props) {
  const leaveDuration =
    leave.days_count < 1 ? `Half Day (${leave.day_type})` : "Full Day";

  return (
    <ScrollView
      style={tw`flex-1 bg-canvas`}
      showsVerticalScrollIndicator={false}
    >
      <View style={tw`bg-white m-4 rounded-xl p-4 shadow`}>
        {/* Header */}
        <Text style={tw`text-section font-bold text-gray-900 mb-1`}>
          Leave Approved
        </Text>
        <Text style={tw`text-green-600 font-semibold mb-4`}>
          This leave request has been approved
        </Text>

        {/* Employee Info */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-description`}>Employee Name</Text>
          <Text style={tw`text-gray-900 text-body font-semibold`}>
            {leave.first_name} {leave.last_name}
          </Text>
        </View>
        {/* Leave Type */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-description`}>Leave Type</Text>
          <Text style={tw`text-gray-900`}>{leave.leave_type_name}</Text>
        </View>
        {/* Dates */}
        <View style={tw`flex-row justify-between mb-4`}>
          <View>
            <Text style={tw`text-gray-500 text-description`}>Start Date</Text>
            <Text style={tw`text-gray-900`}>{leave.start_date}</Text>
          </View>
          <View>
            <Text style={tw`text-gray-500 text-description`}>End Date</Text>
            <Text style={tw`text-gray-900`}>{leave.end_date}</Text>
          </View>
        </View>
        {/* Duration */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-description`}>Duration</Text>
          <Text style={tw`text-gray-900`}>{leaveDuration}</Text>
        </View>
        {/* Reason */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-description`}>Reason</Text>
          <Text style={tw`text-gray-900`}>{leave.reason || "N/A"}</Text>
        </View>
        {/* Approved Info */}
        <View style={tw`border-t border-gray-200 pt-4`}>
          <Text style={tw`text-gray-500 text-description`}>Status</Text>
          <Text style={tw`text-green-600 font-semibold mb-2`}>
            {leave.status?.toUpperCase()}
          </Text>
          <Text style={tw`text-gray-500 text-description`}>Approved By</Text>
          <Text style={tw`text-gray-900 mb-2`}>
            {leave.action_taken_by_name || "N/A"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
