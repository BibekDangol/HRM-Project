import { Circle } from "lucide-react-native";
import { Text, View } from "react-native";
import tw from "twrnc";

export type CalendarLegendItem = {
  key: string;
  label: string;
  color: string;
};

type Props = {
  items: CalendarLegendItem[];
};

export function CalendarLegend({ items }: Props) {
  return (
    <View style={tw`flex-row gap-4 px-5 mb-3`}>
      {items.map((item) => (
        <View key={item.key} style={tw`flex-row items-center gap-1.5`}>
          <Circle color={item.color} fill={item.color} size={9} />
          <Text style={tw`text-sm text-slate-500`}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
