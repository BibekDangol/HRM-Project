import { Pressable, Text, View } from "react-native";
import tw from "twrnc";
interface DateFieldProps {
  label: string;
  value: string;
  onPress?: () => void; 
}
export const DateField = ({ label, value, onPress }: DateFieldProps) => {
  return (
    <View style={tw`mt-4`}>
      <Text style={tw`text-slate-800 font-semibold`}>{label}</Text>

      <Pressable
        onPress={onPress} disabled={!onPress}
        style={({ pressed }) => [
          tw`mt-2 px-4 py-3 rounded-2xl border border-slate-200 bg-white`,
          pressed && tw`opacity-85`,
        ]}
      >
        <Text
          style={tw`${value ? "text-slate-900" : "text-slate-400"} font-semibold`}
        >
          {value || `Pick ${label.toLowerCase()}`}
        </Text>
      </Pressable>
    </View>
  );
};
