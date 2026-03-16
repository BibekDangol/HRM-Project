import * as React from "react";

import {
  BookUser,
  CalendarFold,
  CalendarX,
  ChevronRight,
  Layers,
} from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import tw from "twrnc";

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
      path: "/(admin)/more/settings/leave/add-leave-type",
    },
    {
      title: "Holidays",
      description: "Manage Holidays",
      icon: CalendarX,
      path: "/(admin)/more/holidays",
    },
    {
      title: "Others",
      description: "Additional admin tools",
      icon: Layers,
      path: "",
    },
  ];

  return (
    <View style={tw`flex-1 ${TW.bgPrimary}`}>
      <ScrollView contentContainerStyle={tw`p-4`}>
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.85}
              onPress={() => item.path && router.push(item.path as any)}
              style={tw`flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 mb-4 border ${TW.BORDER}`}
            >
              {/* Left Section */}
              <View style={tw`flex-row items-center`}>
                <View
                  style={tw`h-12 w-12 rounded-xl items-center justify-center mr-4 bg-[#E6F1F3]`}
                >
                  <Icon size={22} color="#1B4A5A" />
                </View>

                <View>
                  <Text style={tw`text-base font-semibold ${TW.textPrimary}`}>
                    {item.title}
                  </Text>

                  <Text style={tw`text-sm ${TW.textSecondary}`}>
                    {item.description}
                  </Text>
                </View>
              </View>

              {/* Right Arrow */}
              <ChevronRight size={20} color="#9ca3af" />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}