import { Pressable, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";

type Props = {
  leaves: any[];
  leaveTypes: any[];
  activeTab: string;
  setActiveTab: (tab: any) => void;
};
export type FilterTab = "all" | "pending" | "approved" | "rejected";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export function Header({ leaves, activeTab, setActiveTab }: Props) {
  const counts: Record<FilterTab, number> = {
    all: leaves.length,
    pending: leaves.filter((l) => l.status?.toLowerCase() === "pending").length,
    approved: leaves.filter((l) => l.status?.toLowerCase() === "approved")
      .length,
    rejected: leaves.filter((l) => l.status?.toLowerCase() === "rejected")
      .length,
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: "row",
          marginTop: 24,
          marginBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
          width: "100%",
        }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = counts[tab.key];
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                marginRight: 24,
                paddingBottom: 12,
                borderBottomWidth: isActive ? 2 : 0,
                borderBottomColor: TW.bgSecondary,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? "#0F172A" : "#94A3B8",
                }}>
                {tab.label}
                {count > 0 && (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: isActive ? TW.bgSecondary : "#CBD5E1",
                    }}>
                    {" "}
                    ({count})
                  </Text>
                )}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
