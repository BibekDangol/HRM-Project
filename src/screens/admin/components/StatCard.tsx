// components/StatCard.tsx

import { Text, View } from "react-native";

import tw from "twrnc";

export default function StatCard({
  title,
  value,
  icon,
  accent = "bg-green-600",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <View
      style={tw`w-[48%] bg-gray-50 rounded-3xl p-4 mb-4 border border-gray-200`}
    >
      {/* Top Row */}
      <View style={tw`flex-row items-center justify-between `}>
        <Text style={tw`text-gray-500 text-sm font-medium`}>
          {title}
        </Text>

        <View
          style={tw`w-9 h-9 rounded-full ${accent} items-center justify-center`}
        >
          {icon}
        </View>
      </View>

      {/* Value */}
      <Text
        style={tw`mt-3 text-3xl font-extrabold text-gray-900`}
      >
        {value}
      </Text>

      {/* Subtext (optional but classy) */}
      <Text style={tw`text-xs text-gray-400 mt-1`}>
        Updated today
      </Text>
    </View>
  );
}
