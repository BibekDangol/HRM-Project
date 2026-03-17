import { Text, View } from "react-native";
import tw from "twrnc";

const SummaryBox = ({
  label,
  value,
  color,
}: {
  label?: string;
  value: number | string;
  color: "green" | "yellow" | "red";
  style?: any;
}) => {
  return (
    <View
      style={tw`bg-white rounded-xl p-1 w-[30%] items-center shadow border border-slate-200`}
    >
      <Text style={tw`text-${color}-600 font-bold text-xl`}>{value}</Text>
      <Text style={tw`text-gray-500`}>{label}</Text>
    </View>
  );
};

export default SummaryBox;
