import * as React from "react";

import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import tw from "twrnc";

export default function MoreScreen() {
  const router = useRouter();
  return (
    <View style={tw`flex-1 bg-gray-100`}>
      <ScrollView contentContainerStyle={tw`p-4`}>

        {/* Attendance */}
        <TouchableOpacity
          onPress={() => router.push("/(admin)/attendance-list")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between shadow`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-green-100 p-3 rounded-xl mr-4`}>
              <Ionicons name="calendar-outline" size={22} color="#16a34a" />
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

          <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
        </TouchableOpacity>

        {/* Others */}
        <TouchableOpacity
          // onPress={() => router.push("/(admin)/Others")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between shadow`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-blue-100 p-3 rounded-xl mr-4`}>
              <Ionicons name="layers-outline" size={22} color="#2563eb" />
            </View>
            <View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Others
              </Text>
              <Text style={tw`text-gray-500 text-sm`}>
                Additional admin tools
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}
