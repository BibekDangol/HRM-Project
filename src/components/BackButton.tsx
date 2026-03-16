import { Pressable, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { TW } from "@/theme/twStyles";

interface BackButtonProps {
  color?: string;
  backgroundColor?: string;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

export function BackButton({
  color = TW.bgSecondary,
  backgroundColor = "rgba(255,255,255,0.2)",
  size = 20,
  onPress,
  style,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      style={({ pressed }) => ({
        height: 36,
        width: 36,
        borderRadius: 12,
        backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
        ...style,
      })}
    >
      <ArrowLeft size={size} color={color} />
    </Pressable>
  );
}
