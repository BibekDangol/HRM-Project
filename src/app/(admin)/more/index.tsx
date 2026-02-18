import * as React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import tw from "twrnc";
import {
  BookUser,
  CalendarFold,
  ChevronRight,
  Layers,
} from "lucide-react-native";

export default function MoreScreen() {
  const router = useRouter();
  return (
    <View style={tw`flex-1 bg-white`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Attendance */}
        <TouchableOpacity
          onPress={() => router.navigate("/more/attendance-list")}
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
        {/* Settings */}
        <TouchableOpacity
          onPress={() => router.push("/(admin)/more/settings")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between shadow border border-slate-100`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-green-100 p-3 rounded-xl mr-4`}>
              <CalendarFold size={22} color="#16a34a" />
            </View>
            <View>
              <Text style={tw`text-lg font-semibold text-gray-900`}>
                Leave Management
              </Text>
              <Text style={tw`text-gray-500 text-sm`}>Add, Update</Text>
            </View>
          </View>
          <ChevronRight size={22} color="#9ca3af" />
        </TouchableOpacity>
        {/* Others */}
        <TouchableOpacity
          // onPress={() => router.push("/(admin)/Others")}
          activeOpacity={0.8}
          style={tw`bg-white rounded-xl p-4 mb-4 flex-row items-center justify-between shadow border border-slate-100`}
        >
          <View style={tw`flex-row items-center`}>
            <View style={tw`bg-blue-100 p-3 rounded-xl mr-4`}>
              <Layers size={22} color="#2563eb" />
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

          <ChevronRight size={22} color="#9ca3af" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
