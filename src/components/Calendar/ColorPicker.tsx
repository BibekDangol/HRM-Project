import { COLOR_PRESETS } from "@/src/constants/adminCalendar";
import { TouchableOpacity, View } from "react-native";
import tw from "twrnc";

export function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <View style={tw`flex-row flex-wrap gap-2 mt-2`}>
      {COLOR_PRESETS.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onChange(c)}
          style={[
            tw`w-8 h-8 rounded-full border-2`,
            {
              backgroundColor: c,
              borderColor: value === c ? "#0f172a" : "transparent",
            },
          ]}
        />
      ))}
    </View>
  );
}
