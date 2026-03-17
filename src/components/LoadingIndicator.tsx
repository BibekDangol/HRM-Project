import { ActivityIndicator, Text, View } from "react-native";
import tw from "twrnc";

type Props = {
  message?: string;
};

export default function LoadingIndicator({ message = "Loading..." }: Props) {
  return (
    <View style={tw`flex-1 items-center justify-center`}>
      <ActivityIndicator size="small" />
      <Text style={tw`mt-2 text-base text-gray-700`}>{message}</Text>
    </View>
  );
}
