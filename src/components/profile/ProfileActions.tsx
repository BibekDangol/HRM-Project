import React from "react";
import { Platform, Pressable, Text } from "react-native";
import { Pencil } from "lucide-react-native";
import { TW } from "@/theme/twStyles";

type Props = {
  onEdit: () => void;
};

export default function ProfileActions({ onEdit }: Props) {
  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: TW.textTertiary,
        borderRadius: 14,
        paddingVertical: 14,
        marginBottom: 24,
        opacity: pressed ? 0.82 : 1,
        ...Platform.select({
          ios: {
            shadowColor: TW.textTertiary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
          },
          android: { elevation: 4 },
        }),
      })}
    >
      <Pencil size={15} color="#fff" strokeWidth={2} />
      <Text
        style={{
          color: "#fff",
          fontWeight: "700",
          fontSize: 15,
          letterSpacing: 0.2,
        }}
      >
        Edit Profile
      </Text>
    </Pressable>
  );
}
