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
      label: "Leave Taken",
      value: stats.leaveTaken,
      color: "#7C3AED",
      bg: "#F3E8FF",
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
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              color: item.color,
            }}
          >
            {loading ? "—" : item.value}
          </Text>

          <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}