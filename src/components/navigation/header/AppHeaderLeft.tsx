import { colors } from "@/theme/colors";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";
import { AppHeaderLeftProps } from "./types";


const AppHeaderLeft: React.FC<AppHeaderLeftProps> = ({
  visible = true,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        marginLeft: 12,
        padding: 6,
        minHeight: 48,
        minWidth: 48,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <ChevronLeft size={26} color={colors.surface} />
    </Pressable>
  );
};

export default AppHeaderLeft;
