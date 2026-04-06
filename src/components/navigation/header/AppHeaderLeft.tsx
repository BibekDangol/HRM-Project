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
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        marginLeft: 12,
        padding: 6,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <ChevronLeft size={26} color="#fff" />
    </Pressable>
  );
};

export default AppHeaderLeft;
