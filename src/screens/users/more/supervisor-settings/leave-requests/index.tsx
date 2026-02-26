import { CalendarCog, ChevronRight } from "lucide-react-native";
import { Href, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import tw from "twrnc";

type SettingItem = {
  id: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description: string;
  route: Href;
};

const settingItems: SettingItem[] = [
  {
    id: "add-leave-type",
    icon: CalendarCog,
    label: "Add Leave Types",
    description: "Create new leave categories",
    route: "/(admin)/more/settings/leave/add-leave-type",
  },
];

export default function UserLeaveRequests() {
  const router = useRouter();

  return (
    <ScrollView
      style={tw`flex-1 bg-white`}
      contentContainerStyle={tw`px-4 pt-6 pb-10`}
    >
      <Text
        style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-3`}
      >
        Leave Management
      </Text>

      <View style={tw`rounded-2xl border border-slate-100 overflow-hidden`}>
        {settingItems.map((item) => (
          <View key={item.id}>
            <Pressable
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [
                tw`flex-row items-center px-4 py-4 bg-white`,
                pressed && tw`bg-slate-50`,
              ]}
            >
              <View
                style={tw`h-10 w-10 rounded-xl bg-blue-50 items-center justify-center mr-4`}
              >
                <CalendarCog size={20} color="#2563eb" />
              </View>

              <View style={tw`flex-1`}>
                <Text style={tw`text-sm font-semibold text-slate-900`}>
                  {item.label}
                </Text>
                <Text style={tw`text-xs text-slate-400 mt-0.5`}>
                  {item.description}
                </Text>
              </View>

              <ChevronRight size={18} color="#cbd5e1" />
            </Pressable>
            <View style={tw`h-px bg-slate-100 mx-4`} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
