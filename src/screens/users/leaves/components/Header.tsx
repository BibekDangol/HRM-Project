import { fontSizes, lineHeights } from "@/theme/typography";
import { colors } from "@/theme/colors";
import { Pressable, ScrollView, Text } from "react-native";
import type { Leave } from "@/src/services/leave.service";

export type FilterTab = "all" | "pending" | "approved" | "rejected";

type Props = {
  leaves: Leave[];
  activeTab: FilterTab;
  setActiveTab: (tab: FilterTab) => void;
};

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export function Header({ leaves, activeTab, setActiveTab }: Props) {
  return (
    <ScrollView
      accessibilityRole="tablist"
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 16 }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = tab.key === "all"
          ? leaves.length
          : leaves.filter((leave) => leave.status?.toLowerCase() === tab.key).length;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            aria-selected={isActive}
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label}, ${count} ${count === 1 ? "request" : "requests"}`}
            onPress={() => setActiveTab(tab.key)}
            style={({ pressed }) => ({
              minHeight: 48,
              paddingHorizontal: 16,
              paddingVertical: 12,
              justifyContent: "center",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: isActive ? colors.primary : colors.border,
              backgroundColor: isActive ? colors.primary : colors.surface,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{
              fontSize: fontSizes.label, lineHeight: lineHeights.label,
              fontWeight: isActive ? "700" : "500",
              color: isActive ? colors.surface : colors.muted,
            }}>
              {tab.label} ({count})
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
