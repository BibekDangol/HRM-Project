import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export type QuickActionItem = {
  label: string;
  icon: ReactNode;
  onPress: () => void;
};

type Props = {
  items: QuickActionItem[];
  title?: string;
};

export default function QuickActionGrid({
  items,
  title = "Quick Actions",
}: Props) {
  return (
    <View>
      <Text style={tw`font-semibold ${TW.textPrimary} py-2 text-lg`}>
        {title}
      </Text>

      <View style={tw`flex-row flex-wrap justify-between`}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.label}
            onPress={item.onPress}
            style={tw`w-[48%] ${TW.bgCards} p-4 rounded-xl mb-3 items-center`}
          >
            {item.icon}
            <Text style={tw`${TW.textPrimary} mt-2 font-medium`}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
