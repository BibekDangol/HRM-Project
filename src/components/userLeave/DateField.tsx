import { Pressable, Text, View } from "react-native";
import tw from "@/theme/tw";

interface DateFieldProps {
  label: string;
  value: string;
  onPress?: () => void;
}

export const DateField = ({ label, value, onPress }: DateFieldProps) => {
  return (
    <View style={tw`mb-3`}>
      {/* Label */}
      <Text style={tw`text-sm text-slate-600 mb-1`}>{label}</Text>

      {/* Field */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value || "Not selected"}`}
        accessibilityHint={onPress ? "Opens the date picker" : undefined}
        accessibilityState={{ disabled: !onPress }}
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [
          tw`px-3 rounded-xl border border-slate-200 bg-white flex-row items-center justify-between`,
          { minHeight: 48, paddingVertical: 12 },
          pressed && tw`opacity-80`,
        ]}
      >
        <Text
          style={tw`${value ? "text-slate-600" : "text-slate-400"} text-sm font-medium flex-shrink`}
        >
          {value || `Select ${label.toLowerCase()}`}
        </Text>
      </Pressable>
    </View>
  );
};
