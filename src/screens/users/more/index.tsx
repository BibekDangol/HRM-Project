import { BookUser, CalendarX, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
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
      style={tw`flex-1 bg-white`}
      contentContainerStyle={tw`px-4 pt-4 pb-6`}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing || statsLoading}
          onRefresh={onRefresh}
          colors={["#1B4A5A"]}
          tintColor="#1B4A5A"
        />
      }
    >
      <View style={tw`px-1`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-lg font-semibold ${TW.textPrimary}`}>
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
            tw`mb-4 flex-row items-center justify-between rounded-2xl px-4 py-4`,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E3EDF0",
            },
          ]}
        >
          <View style={tw`flex-1 flex-row items-center`}>
            <View
              style={[
                tw`mr-4 h-12 w-12 items-center justify-center rounded-xl`,
                { backgroundColor: "#EEF6F8" },
              ]}
            >
              <BookUser size={22} color="#1B4A5A" />
            </View>

            <View style={tw`flex-1`}>
              <Text style={[tw`text-base font-semibold`, { color: "#1B4A5A" }]}>
                Attendance
              </Text>
              <Text style={[tw`mt-0.5 text-sm`, { color: "#7AA5B2" }]}>
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
            tw`flex-row items-center justify-between rounded-2xl px-4 py-4`,
            {
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E3EDF0",
            },
          ]}
        >
          <View style={tw`flex-1 flex-row items-center`}>
            <View
              style={[
                tw`mr-4 h-12 w-12 items-center justify-center rounded-xl`,
                { backgroundColor: "#EEF6F8" },
              ]}
            >
              <CalendarX size={22} color="#1B4A5A" />
            </View>

            <View style={tw`flex-1`}>
              <Text style={[tw`text-base font-semibold`, { color: "#1B4A5A" }]}>
                Leave
              </Text>
              <Text style={[tw`mt-0.5 text-sm`, { color: "#7AA5B2" }]}>
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
