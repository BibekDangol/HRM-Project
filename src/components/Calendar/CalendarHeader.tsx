import { Pressable, Text, View } from "react-native";
import tw from "@/theme/tw";
import { Settings } from "lucide-react-native";
import { colors } from "@/theme/colors";

interface Props {
  onSettingsPress: () => void;
}

export function CalendarHeader({ onSettingsPress }: Props) {
  return (
    <View style={tw`flex-row items-center justify-between p-5`}>
      <Text style={tw`text-page font-extrabold text-slate-900`}>Calendar</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Calendar settings"
        onPress={onSettingsPress}
        hitSlop={10}
        style={({ pressed }) => [
          tw`h-12 w-12 items-center justify-center rounded-full bg-surface`,
          pressed && tw`opacity-70`,
        ]}
      >
        <Settings size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}
