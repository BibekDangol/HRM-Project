import { colors } from "@/theme/colors";
import {
  BookUser,
  CalendarFold,
  CalendarX,
  ChevronRight,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";
import { useRouter } from "expo-router";

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    {
      title: "Attendance",
      description: "View employee attendance",
      icon: BookUser,
      path: "/more/attendance-list",
    },
    {
      title: "Leave Management",
      description: "Add, Update",
      icon: CalendarFold,
      path: "/(admin)/(main-tabs)/more/leave-type",
    },
    {
      title: "Holidays",
      description: "Manage Holidays",
      icon: CalendarX,
      path: "/(admin)/(main-tabs)/more/holidays",
    },
  ];

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <ScrollView
        contentContainerStyle={tw`p-4`}
        showsVerticalScrollIndicator={false}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => item.path && router.push(item.path as any)}
              style={tw`flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 mb-4 border ${TW.BORDER}`}>
              {/* Left Section */}
              <View style={tw`flex-row items-center`}>
                <View
                  style={tw`h-12 w-12 rounded-xl items-center justify-center mr-4 bg-primarySoft`}>
                  <Icon size={22} color={colors.primary} />
                </View>

                <View>
                  <Text style={tw`text-body font-semibold ${TW.textPrimary}`}>
                    {item.title}
                  </Text>

                  <Text style={tw`text-description ${TW.textSecondary}`}>
                    {item.description}
                  </Text>
                </View>
              </View>

              {/* Right Arrow */}
              <ChevronRight size={20} color={colors.subtle} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
