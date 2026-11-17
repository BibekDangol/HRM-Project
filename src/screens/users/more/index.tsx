import { colors } from "@/theme/colors";
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
import tw from "@/theme/tw";

export default function SupervisorSettings() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      style={tw`flex-1 bg-canvas`}
      contentContainerStyle={tw`px-4 pt-4 pb-6`}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={tw`px-1`}>
        <View style={tw`mb-4`}>
          <Text style={tw`text-section font-semibold ${TW.textPrimary}`}>
            Supervisor Settings
          </Text>
        </View>

        {/* Attendance */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.navigate("/(users)/(main-tabs)/more/supervisor-settings/attendance-list")
          }
          style={[
            tw`mb-4 flex-row items-center justify-between rounded-2xl px-4 py-4`,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
            },
          ]}
        >
          <View style={tw`flex-1 flex-row items-center`}>
            <View
              style={[
                tw`mr-4 h-12 w-12 items-center justify-center rounded-xl`,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <BookUser size={22} color={colors.primary} />
            </View>

            <View style={tw`flex-1`}>
              <Text style={[tw`text-body font-semibold`, { color: colors.ink }]}>
                Attendance
              </Text>
              <Text style={[tw`mt-0.5 text-description`, { color: colors.muted }]}>
                View attendance records
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color={colors.primaryMuted} />
        </TouchableOpacity>

        {/* Leave */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.navigate("/(users)/(main-tabs)/more/supervisor-settings/leave")
          }
          style={[
            tw`flex-row items-center justify-between rounded-2xl px-4 py-4`,
            {
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.primaryBorder,
            },
          ]}
        >
          <View style={tw`flex-1 flex-row items-center`}>
            <View
              style={[
                tw`mr-4 h-12 w-12 items-center justify-center rounded-xl`,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <CalendarX size={22} color={colors.primary} />
            </View>

            <View style={tw`flex-1`}>
              <Text style={[tw`text-body font-semibold`, { color: colors.ink }]}>
                Leave
              </Text>
              <Text style={[tw`mt-0.5 text-description`, { color: colors.muted }]}>
                Manage leave requests
              </Text>
            </View>
          </View>

          <ChevronRight size={20} color={colors.primaryMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
