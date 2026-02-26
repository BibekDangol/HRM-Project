import { BookUser, CalendarX, ChevronRight } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useRouter } from "expo-router";
import React from "react";
import tw from "twrnc";

export default function SupervisorSettings() {
  const router = useRouter();

  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Attendance */}
        <TouchableOpacity
          onPress={() => router.navigate("/(users)/more/supervisor-settings/attendance-list")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center border border-slate-100 justify-between shadow`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-green-100 p-3 rounded-xl mr-4`}>
              <BookUser size={22} color="#16a34a" />
            </View>
            <View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Attendance
              </Text>
              <Text style={tw`text-gray-500 text-sm`}>
                View employee attendance
              </Text>
            </View>
          </View>
          <ChevronRight size={22} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(users)/more/supervisor-settings/leave-management")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between shadow border border-slate-100`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-green-100 p-3 rounded-xl mr-4`}>
              <CalendarX size={22} color="#16a34a" />
            </View>
            <View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Leaves
              </Text>
              <Text style={tw`text-gray-500 text-sm`}>Accept, Reject Leave</Text>
            </View>
          </View>

          <ChevronRight size={22} color="#9ca3af" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
