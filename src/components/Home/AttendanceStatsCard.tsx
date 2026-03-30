import { Text, View } from "react-native";

import React from "react";

type Stats = {
  present: number;
  absent: number;
  late: number;
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
      color: "#008080",
      bg: "#E6F4F4",
    },
    {
      label: "Absent",
      value: stats.absent,
      color: "#EF4444",
      bg: "#FEE2E2",
    },
    {
      label: "Late",
      value: stats.late,
      color: "#F59E0B",
      bg: "#FFFBEB",
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
            padding: 12,
            alignItems: "center",
          }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: item.color,
            }}>
            {loading ? "—" : item.value}
          </Text>

          <Text style={{ fontSize: 12, color: "#6B7280" }}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
