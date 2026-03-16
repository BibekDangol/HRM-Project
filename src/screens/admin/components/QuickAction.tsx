import { CalendarPlus, Clock, FileText, UserPlus } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import React from "react";
import tw from "twrnc";

const QuickActions = () => {
  const router = useRouter();
  return (
    <View style={tw``}>
      <Text style={tw`font-semibold ${TW.textPrimary} py-2 text-lg`}>
        Quick Actions
      </Text>

      <View style={tw`flex-row flex-wrap justify-between`}>
        {/* Add Employee */}
        <TouchableOpacity
          onPress={() => router.replace('/(admin)/manage-users')}
          style={tw`w-[48%] ${TW.bgCards} p-4 rounded-xl mb-3 items-center`}
        >
          <UserPlus size={24} color="#1B4A5A" />
          <Text style={tw`${TW.textPrimary} mt-2 font-medium`}>
            Add Employee
          </Text>
        </TouchableOpacity>

        {/* Request Leave */}
        <TouchableOpacity
          onPress={() => router.replace('/(admin)/leave')}
          style={tw`w-[48%] ${TW.bgCards} p-4 rounded-xl mb-3 items-center`}
        >
          <CalendarPlus size={24} color="#1B4A5A" />
          <Text style={tw`${TW.textPrimary} mt-2 font-medium`}>
            Request Leave
          </Text>
        </TouchableOpacity>

        {/* Attendance */}
        <TouchableOpacity
          onPress={() => router.replace('/(admin)/more/attendance-list')}
          style={tw`w-[48%] ${TW.bgCards} p-4 rounded-xl mb-3 items-center`}
        >
          <Clock size={24} color="#1B4A5A" />
          <Text style={tw`${TW.textPrimary} mt-2 font-medium`}>
            Attendance
          </Text>
        </TouchableOpacity>

        {/* Reports */}
        <TouchableOpacity
          onPress={() => router.replace('/(admin)/more/holidays')}
          style={tw`w-[48%] ${TW.bgCards} p-4 rounded-xl mb-3 items-center`}
        >
          <FileText size={24} color="#1B4A5A" />
          <Text style={tw`${TW.textPrimary} mt-2 font-medium`}>
            Holidays
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default QuickActions;