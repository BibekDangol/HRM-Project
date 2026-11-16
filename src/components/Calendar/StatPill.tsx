import { Text, View } from "react-native";
import tw from "@/theme/tw";

export function StatPill({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <View
      style={[
        tw`flex-1 items-center py-3 rounded-2xl`,
        { backgroundColor: color + "18" },
      ]}
    >
      <Text style={[tw`text-xl font-extrabold`, { color }]}>{count}</Text>
      <Text style={[tw`text-xs font-semibold mt-0.5`, { color: color + "cc" }]}>
        {label}
      </Text>
    </View>
  );
}