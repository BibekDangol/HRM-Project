import React from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight, Lock } from "lucide-react-native";
import { TW } from "@/theme/twStyles";

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
  locked?: boolean;
};

export default function InfoRow({
  icon,
  label,
  value,
  onPress,
  isLast,
  locked,
}: Props) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: "#ffffff",
        opacity: pressed && onPress && !locked ? 0.6 : 1,
        borderBottomWidth: isLast ? 0 : 0.5,
        borderBottomColor: "#E5E7EB", 
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: `${TW.bgSecondary}12`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 13,
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: "#D3D3D3 ",
            letterSpacing: 0.3,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: locked ? "#D3D3D3 " : TW.bgSecondary,
            letterSpacing: 0.1,
          }}
          numberOfLines={1}
        >
          {value || "—"}
        </Text>
      </View>

      {locked ? (
        <Lock size={13} color={"#6B7280"} strokeWidth={1.6} />
      ) : onPress ? (
        <ChevronRight size={15} color={"#6B7280"} strokeWidth={1.6} />
      ) : null}
    </Pressable>
  );
}
