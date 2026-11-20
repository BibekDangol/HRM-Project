import HeaderWithSearch from "@/src/components/SearchBar";
import { HomeScreenHeader } from "@/src/components/navigation/header/AppHeader";
import type { ListScreenTab } from "@/src/components/lists/ListScreen";
import { colors } from "@/theme/colors";
import { UserPlus, Users } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  loading: boolean;
  tabs: ListScreenTab<"pending" | "active">[];
  activeTab: "pending" | "active";
  onTabChange: (value: "pending" | "active") => void;
  onAdd: () => void;
  count: number;
};

export default function ManageUsersHeader({ search, onSearchChange, loading, tabs, activeTab, onTabChange, onAdd, count }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.fullBleed}><HomeScreenHeader /></View>
      <View style={styles.heading}>
        <View style={styles.titleGroup}><Text style={styles.eyebrow}>DIRECTORY</Text><Text accessibilityRole="header" style={styles.title}>Team members</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Add employee" onPress={onAdd} style={({ pressed }) => [styles.add, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}>
          <UserPlus size={18} color={colors.surface} /><Text style={styles.addText}>Add employee</Text>
        </Pressable>
      </View>
      <View style={styles.fullBleed}><HeaderWithSearch search={search} onSearchChange={onSearchChange} loading={loading} placeholder="Search by name or email…" /></View>
      <View accessibilityRole="tablist" style={styles.tabs}>
        {[...tabs].reverse().map((tab) => {
          const selected = activeTab === tab.key;
          return (
            <Pressable key={tab.key} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onTabChange(tab.key)} style={({ pressed }) => [styles.tab, selected && styles.selectedTab, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.tabText, selected && { color: colors.primary }]}>{tab.key === "pending" ? "Pending invites" : "Active"}</Text>
              <View style={[styles.badge, selected && { backgroundColor: colors.primarySoft }]}><Text style={[styles.badgeText, selected && { color: colors.primary }]}>{tab.count}</Text></View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.stats}><Users size={14} color={colors.subtle} /><Text style={styles.eyebrow}>{count} {search.trim() ? "MATCHING ACCOUNTS" : "TOTAL REGISTERED"}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 14, paddingBottom: 16 },
  fullBleed: { marginHorizontal: -16 },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
  titleGroup: { gap: 4 },
  eyebrow: { color: colors.subtle, fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 24, lineHeight: 31, letterSpacing: -0.7, fontWeight: "700" },
  add: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, minHeight: 48, paddingHorizontal: 14, borderRadius: 14 },
  addText: { color: colors.surface, fontSize: 13, lineHeight: 18, fontWeight: "600" },
  tabs: { flexDirection: "row", gap: 4, borderRadius: 14, padding: 4, backgroundColor: colors.surfaceMuted },
  tab: { flex: 1, minHeight: 48, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 8 },
  selectedTab: { backgroundColor: colors.surface, boxShadow: "0 2px 6px rgba(23,23,23,0.06)" },
  tabText: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  badge: { backgroundColor: colors.border, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  badgeText: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: "700" },
  stats: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 2 },
});
