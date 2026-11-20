import type { ReactNode } from "react";
import { Text, Pressable, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

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
  title = "Quick actions",
}: Props) {
  return (
    <View style={tw`gap-3`}>
      <Text accessibilityRole="header" style={tw`font-semibold ${TW.textPrimary} text-section`}>
        {title}
      </Text>

      <View style={tw`flex-row flex-wrap gap-3`}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={item.onPress}
            style={({ pressed }) => [
              tw`${TW.bgCards} p-4 rounded-xl items-center min-h-[96px] justify-center gap-2`,
              { flexBasis: "45%", flexGrow: 1, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            {item.icon}
            <Text style={tw`${TW.textPrimary} text-description text-center font-medium`}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
