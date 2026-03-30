import { CircleCheck, LogOut } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import React from "react";

type Props = {
  isCheckedIn: boolean;
  elapsedMs: number;
  checkedInAt?: Date | null;
  isLocked?: boolean;
  onToggle: () => void;

  // optional formatting functions (keeps UI pure)
  formatElapsed: (ms: number) => string;
  formatSinceTime: (date: Date | null | undefined) => string;
};

export function CheckInCard({
  isCheckedIn,
  elapsedMs,
  checkedInAt,
  isLocked,
  onToggle,
  formatElapsed,
  formatSinceTime,
}: Props) {
  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: "#0F172A",
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
      {/* LEFT SIDE */}
      <View style={{ gap: 4 }}>
        <Text style={{ color: "#94A3B8", fontSize: 12 }}>
          {isCheckedIn ? "Currently working" : "Not checked in"}
        </Text>

        {isCheckedIn ? (
          <>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "800",
                color: "white",
              }}>
              {formatElapsed(elapsedMs)}
            </Text>

            <Text style={{ color: "#94A3B8", fontSize: 11 }}>
              Since {formatSinceTime(checkedInAt)}
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: 20, color: "#64748B" }}>--:--:--</Text>
        )}
      </View>

      {/* RIGHT BUTTON */}
      <Pressable
        disabled={isLocked}
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: "#FFC107",
          opacity: isLocked || pressed ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}>
        {isCheckedIn ? (
          <LogOut size={16} color="#1F2937" />
        ) : (
          <CircleCheck size={16} color="#1F2937" />
        )}

        <Text style={{ fontWeight: "700", color: "#1F2937" }}>
          {isLocked ? "..." : isCheckedIn ? "Check Out" : "Check In"}
        </Text>
      </Pressable>
    </View>
  );
}
