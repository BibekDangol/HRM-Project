import { colors } from "@/theme/colors";
import { User } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

import { HeaderProfileButtonProps } from "./types";

const HeaderProfileButton: React.FC<HeaderProfileButtonProps> = ({
  onPress,
  disabled = false,
  size = 36,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open profile menu"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        height: Math.max(size, 48),
        width: Math.max(size, 48),
        borderRadius: Math.max(size, 48) / 2,
        backgroundColor: colors.onPrimaryWashMedium,
        borderWidth: 2,
        borderColor: colors.onPrimaryHalf,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
      })}
    >
      <User size={17} color={colors.surface} />
    </Pressable>
  );
};

export default HeaderProfileButton;