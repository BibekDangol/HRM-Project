import { View } from "react-native";
import tw from "@/theme/tw";

export function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <View
      style={[
        tw`rounded-full`,
        { width: size, height: size, backgroundColor: color },
      ]}
    />
  );
}