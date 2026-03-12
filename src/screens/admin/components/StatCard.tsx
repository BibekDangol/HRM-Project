// components/StatCard.tsx

import { Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export default function StatCard({
  title,
  value,
  icon,
  accent = TW.bgAction,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <View
      style={tw`w-full ${TW.bgButton} ${TW.BORDER} border rounded-3xl p-4 mb-4`}
    >
      {/* Top Row */}
      <View style={tw`flex-row items-center gap-4 justify-between`}>
        <Text style={tw`${TW.textSecondary} text-sm font-medium`}>
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
        style={tw`mt-3 text-3xl font-extrabold ${TW.textPrimary}`}
      >
        {value}
      </Text>

      {/* Subtext */}
      <Text style={tw`${TW.textSecondary} text-xs mt-1`}>
        Updated today
      </Text>
    </View>
  );
}