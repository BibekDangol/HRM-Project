import { TW } from "@/theme/twStyles";
import { Pencil } from "lucide-react-native";
import React from "react";
import { Platform, Pressable } from "react-native";

type Props = {
  onEdit: () => void;
};

export default function ProfileActions({ onEdit }: Props) {
  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignSelf: "flex-end",
        justifyContent: "flex-end",
        gap: 8,
        backgroundColor: "#FFB300",
        borderRadius: 24,
        padding: 14, // background only around icon
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
      <Pencil size={18} color="#fff" strokeWidth={2} />
    </Pressable>
  );
}
