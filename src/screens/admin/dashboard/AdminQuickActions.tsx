import { colors } from "@/theme/colors";
import { useRouter } from "expo-router";
import { CalendarDays, Clock, FileText, UserPlus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function AdminQuickActions({ onAddEmployee }: { onAddEmployee: () => void }) {
  const router = useRouter();
  const items = [
    { label: "Add employee", description: "New team onboard", Icon: UserPlus, onPress: onAddEmployee },
    { label: "Manage leave", description: "Requests & approvals", Icon: FileText, onPress: () => router.push("/(admin)/(main-tabs)/leave") },
    { label: "Attendance", description: "Time logs & history", Icon: Clock, onPress: () => router.push("/(admin)/(main-tabs)/more/attendance-list") },
    { label: "Calendar", description: "Holidays & events", Icon: CalendarDays, onPress: () => router.push("/(admin)/(main-tabs)/more/holidays") },
  ];
  return (
    <View style={styles.section}>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={styles.title}>Quick actions</Text>
        <Text style={styles.eyebrow}>ADMIN SHORTCUTS</Text>
      </View>
      <View style={styles.grid}>
        {items.map(({ label, description, Icon, onPress }) => (
          <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
            style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.primarySoft : colors.surface, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
            <View style={styles.icon}><Icon size={22} color={colors.primary} /></View>
            <View style={styles.copy}><Text style={styles.label}>{label}</Text><Text style={styles.description}>{description}</Text></View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  eyebrow: { fontSize: 10, lineHeight: 14, fontWeight: "700", color: colors.subtle, letterSpacing: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flexBasis: "45%", flexGrow: 1, minHeight: 132, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border, gap: 14, boxShadow: "0 4px 12px rgba(23,23,23,0.04)" },
  icon: { height: 40, width: 40, borderRadius: 12, backgroundColor: colors.primaryWash, alignItems: "center", justifyContent: "center" },
  copy: { gap: 4 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: "600", color: colors.ink },
  description: { fontSize: 11, lineHeight: 16, color: colors.muted },
});
