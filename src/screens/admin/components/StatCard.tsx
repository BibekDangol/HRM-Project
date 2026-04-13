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
    <>
      <Text style={tw`font-semibold ${TW.textPrimary} pb-2 text-lg`}>
        High-Level Metrics
      </Text>
      <View style={tw`overflow-hidden rounded-xl ${TW.bgButton} ${TW.BORDER} border`}>
        <View style={tw`h-0.5 w-full ${accent}`} />
        <View style={tw`flex-row items-center gap-3 px-4 py-3`}>
          <View style={tw`w-8 h-8 rounded-lg ${accent} items-center justify-center shrink-0`}>
            {icon}
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`${TW.textSecondary} text-[10px] font-semibold uppercase tracking-wider`}>
              {title}
            </Text>
            <Text style={tw`${TW.textPrimary} text-2xl font-extrabold leading-tight`}>
              {value}
            </Text>
          </View>
          <View style={tw`items-end gap-0.5`}>
            <View style={tw`flex-row items-center gap-1`}>
              <View style={tw`w-1.5 h-1.5 rounded-full ${accent}`} />
              <Text style={tw`${TW.textSecondary} text-[10px] font-medium`}>Live</Text>
            </View>
            <Text style={tw`${TW.textSecondary} text-[10px]`}>Updated today</Text>
          </View>
        </View>
      </View>
    </>
  );
}