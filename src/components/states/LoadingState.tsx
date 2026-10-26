import { ActivityIndicator, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import tw from "twrnc";

type Props = {
  message?: string;
  fullScreen?: boolean;
  color?: string;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
};

export default function LoadingState({
  message = "Loading...",
  fullScreen = false,
  color,
  size = "small",
  style,
}: Props) {
  return (
    <View
      style={[
        fullScreen
          ? tw`flex-1 items-center justify-center`
          : tw`items-center justify-center py-6`,
        style,
      ]}
    >
      <ActivityIndicator size={size} color={color} />
      {message ? (
        <Text style={tw`mt-2 text-base text-gray-700`}>{message}</Text>
      ) : null}
    </View>
  );
}
