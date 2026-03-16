import { useRouter } from "expo-router";
import { BookUser, CalendarX, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";

export default function SupervisorSettings() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const onRefresh = async () => {
    try {
      setIsRefreshing(true);
    } finally {
      setIsRefreshing(false);
    }
  };
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={tw`bg-white p-4 flex-1`}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || statsLoading}
          onRefresh={onRefresh}
        />
      }
    >
      <View style={tw`px-1 pt-2 pb-6`}>
        <View style={tw`mb-3`}>
          <Text style={[tw`text-lg font-bold text-gray-800`]}>
            Supervisor Settings
          </Text>
        </View>
        {/* Attendance */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.navigate("/(users)/more/supervisor-settings/attendance-list")
          }
          style={[
            tw`rounded-2xl px-4 py-5 mb-4 flex-row items-center justify-between`,
            {
              backgroundColor: "#FFFFFF",
              shadowColor: "#1B4A5A",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            },
          ]}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <View
              style={[
                tw`w-12 h-12 rounded-xl items-center justify-center mr-4`,
                { backgroundColor: "#EEF6F8" },
              ]}
            >
              <BookUser size={22} color="#1B4A5A" />
            </View>
            <View>
              <Text style={[tw`text-base font-semibold`, { color: "#1B4A5A" }]}>
                Attendance
              </Text>
              <Text style={[tw`text-sm mt-0.5`, { color: "#7AA5B2" }]}>
                View attendance records
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#7AA5B2" />
        </TouchableOpacity>

        {/* Leave */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.navigate("/(users)/more/supervisor-settings/leave")
          }
          style={[
            tw`rounded-2xl px-4 py-5 flex-row items-center justify-between`,
            {
              backgroundColor: "#FFFFFF",
              shadowColor: "#1B4A5A",
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            },
          ]}
        >
          <View style={tw`flex-row items-center flex-1`}>
            <View
              style={[
                tw`w-12 h-12 rounded-xl items-center justify-center mr-4`,
                { backgroundColor: "#EEF6F8" },
              ]}
            >
              <CalendarX size={22} color="#1B4A5A" />
            </View>
            <View>
              <Text style={[tw`text-base font-semibold`, { color: "#1B4A5A" }]}>
                Leave
              </Text>
              <Text style={[tw`text-sm mt-0.5`, { color: "#7AA5B2" }]}>
                Manage leave requests
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color="#7AA5B2" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
