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
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        height: size,
        width: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.5)",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
      })}
    >
      <User size={17} color="#ffffff" />
    </Pressable>
  );
};

export default HeaderProfileButton;