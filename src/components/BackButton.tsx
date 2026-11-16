import { colors } from "@/theme/colors";
import { TW } from "@/theme/twStyles";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, ViewStyle } from "react-native";

interface BackButtonProps {
  color?: string;
  backgroundColor?: string;
  size?: number;
  onPress?: () => void;
  style?: ViewStyle;
  floating?: boolean;
}

export function BackButton({
  color = TW.bgSecondary,
  backgroundColor = colors.onPrimaryWashStrong,
  size = 20,
  onPress,
  style,
  floating = false,
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress ?? (() => router.back())}
      style={({ pressed }) => ({
        height: 48,
        width: 48,
        borderRadius: 12,
        backgroundColor: floating ? colors.surface : backgroundColor,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.7 : 1,
        ...(floating && {
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 999,
          backgroundColor: "transparent",
        }),

        ...style,
      })}
    >
      <ChevronLeft size={size} color={floating ? TW.bgSecondary : color} />
    </Pressable>
  );
}

export default BackButton;
