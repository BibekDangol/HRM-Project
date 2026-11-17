import { ScrollView, Text, View } from "react-native";

import { Leave } from "@/src/services/leave.service";
import React from "react";
import tw from "@/theme/tw";

interface Props {
  leave: Leave;
  leaveDuration: string;
}
const RejectedLeaveView = ({ leave, leaveDuration }: Props) => {
  console.log("leave", leave);
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={tw`flex-1 bg-canvas`}
    >
      <View style={tw`bg-white m-4 rounded-xl p-4 shadow`}>
        {/* Header */}
        <Text style={tw`text-lg font-bold text-gray-900 mb-1`}>
          Leave Rejected
        </Text>
        <Text style={tw`text-red-600 font-semibold mb-4`}>
          This leave request has been rejected
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
          <Text style={tw`text-gray-900`}>
            {leave.leave_type_name || leave.leave_types?.name}
          </Text>
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
          <Text style={tw`text-gray-900`}>{leaveDuration}</Text>
        </View>

        {/* Reason */}
        <View style={tw`mb-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Reason</Text>
          <Text style={tw`text-gray-900`}>{leave.reason || "N/A"}</Text>
        </View>

        {/* Rejection Info */}
        <View style={tw`border-t border-gray-200 pt-4`}>
          <Text style={tw`text-gray-500 text-sm`}>Status</Text>
          <Text style={tw`text-red-600 font-semibold mb-2`}>
            {leave.status.toUpperCase()}
          </Text>

          <Text style={tw`text-gray-500 text-sm`}>Rejected By</Text>
          <Text style={tw`text-gray-900 mb-2`}>
            {leave.action_taken_by_name || "N/A"}
          </Text>

          <Text style={tw`text-gray-500 text-sm`}>Rejection Reason</Text>
          {/* <Text style={tw`text-red-700`}>
            {leave.rejectionReason || "No reason provided"}
          </Text> */}
        </View>
      </View>
    </ScrollView>
  );
};

export default RejectedLeaveView;
