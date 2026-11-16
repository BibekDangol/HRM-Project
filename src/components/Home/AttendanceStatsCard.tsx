import { colors } from "@/theme/colors";
import { Text, View } from "react-native";

import React from "react";

type Stats = {
  present: number;
  absent: number;
  leaveTaken: number;
  incomplete?: number;
};

type Props = {
  stats: Stats;
  loading: boolean;
};

export function AttendanceStatsCard({ stats, loading }: Props) {
  const items = [
    {
      label: "Present",
      value: stats.present,
      color: colors.success,
      bg: colors.surface,
    },
    {
      label: "Absent",
      value: stats.absent,
      color: colors.danger,
      bg: colors.surface,
    },
    {
      label: "Leave Taken",
      value: stats.leaveTaken,
      color: colors.primary,
      bg: colors.surface,
    },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      {items.map((item) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            backgroundColor: item.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: colors.ink,
            }}
          >
            {loading ? "—" : item.value}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.color }} />
            <Text style={{ fontSize: 14, color: colors.muted, flexShrink: 1, textAlign: "center" }}>
              {item.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}