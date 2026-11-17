import { fontSizes, lineHeights } from "@/theme/typography";
import { colors } from "@/theme/colors";
import { CircleCheck, LogOut } from "lucide-react-native";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import React from "react";

type Props = {
  isCheckedIn: boolean;
  elapsedMs: number;
  checkedInAt?: Date | null;
  isLocked?: boolean;
  pendingAction?: "checkin" | "checkout" | null;
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
  pendingAction,
  onToggle,
  formatElapsed,
  formatSinceTime,
}: Props) {
  const idleMessage = pendingAction === "checkin"
    ? "Starting your work session…"
    : isLocked ? "Getting your latest status…" : "Ready to start your day?";

  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: colors.primarySoft,
        padding: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* LEFT SIDE */}
      <View style={{ gap: 4, flexGrow: 1, flexShrink: 1, flexBasis: 160 }}>
        <Text style={{ color: colors.muted, fontSize: fontSizes.label, lineHeight: lineHeights.label }}>
          {isLocked && !pendingAction ? "Attendance" : isCheckedIn ? "Currently working" : "Not checked in"}
        </Text>

        {isCheckedIn ? (
          <>
            <Text
              style={{
                fontSize: fontSizes.metric, lineHeight: lineHeights.metric,
                fontWeight: "800",
                color: colors.ink,
              }}
            >
              {formatElapsed(elapsedMs)}
            </Text>

            <Text style={{ color: colors.muted, fontSize: fontSizes.label, lineHeight: lineHeights.label }}>
              Since {formatSinceTime(checkedInAt)}
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: fontSizes.section, lineHeight: lineHeights.section, fontWeight: "600", color: colors.ink }}>
            {idleMessage}
          </Text>
        )}
      </View>

      {/* RIGHT BUTTON */}
      <Pressable
        accessibilityRole="button"
        aria-busy={isLocked}
        accessibilityState={{ disabled: isLocked, busy: isLocked }}
        disabled={isLocked}
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 12,
          minHeight: 48,
          borderRadius: 12,
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          opacity: isLocked || pressed ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        {isLocked ? (
          <ActivityIndicator size="small" color={colors.surface} />
        ) : isCheckedIn ? (
          <LogOut size={16} color={colors.surface} />
        ) : (
          <CircleCheck size={16} color={colors.surface} />
        )}

        <Text accessibilityLiveRegion="polite" style={{ fontWeight: "700", color: colors.surface }}>
          {isLocked
            ? pendingAction === "checkin" ? "Checking in…"
              : pendingAction === "checkout" ? "Checking out…" : "Loading attendance…"
            : isCheckedIn ? "Check out" : "Check in"}
        </Text>
      </Pressable>
    </View>
  );
}
