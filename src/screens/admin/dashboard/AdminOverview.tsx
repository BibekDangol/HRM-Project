import AppButton from "@/src/components/ui/AppButton";
import type { AdminDashboardOverview } from "@/src/services/admin/dashboard.service";
import { colors } from "@/theme/colors";
import { ArrowRight, BellRing, ChevronRight, CircleCheck } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type OverviewProps = {
  overview: AdminDashboardOverview | null;
  error: boolean;
};

export default function AdminOverview({ overview, error, onReviewLeaves }: OverviewProps & {
  onReviewLeaves: () => void;
}) {
  const available = !error && overview != null;
  return (
    <View style={[styles.card, styles.attention]}>
      <View style={styles.row}>
        <View style={styles.icon}><BellRing size={22} color={colors.surface} /></View>
        <View style={styles.copy}>
          <View style={styles.headingRow}>
            <Text accessibilityRole="header" style={styles.title}>Needs your attention</Text>
            {available && <View style={styles.badge}><Text style={styles.badgeText}>{overview.pendingLeaves} pending</Text></View>}
          </View>
          <Text accessibilityRole={error ? "alert" : undefined} style={styles.description}>
            {error ? "Leave counts could not be loaded. Pull down to retry." : !available ? "Loading leave requests…" : overview.pendingLeaves === 0 ? "All caught up. No requests waiting for review." : `${overview.pendingLeaves} leave ${overview.pendingLeaves === 1 ? "request is" : "requests are"} waiting for your approval.`}
          </Text>
        </View>
      </View>
      <AppButton title="Review requests" onPress={onReviewLeaves} icon={<ArrowRight size={18} color={colors.surface} />} fullWidth />
    </View>
  );
}

export function AttendanceOverview({ overview, error, onViewAttendance }: OverviewProps & {
  onViewAttendance: () => void;
}) {
  const available = !error && overview != null;
  const dateLabel = overview && new Date(`${overview.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", timeZone: "UTC",
  });
  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.row}><View style={styles.dot} /><Text accessibilityRole="header" style={styles.title}>Today’s attendance</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="View attendance" onPress={onViewAttendance} style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={styles.linkText}>View attendance</Text><ChevronRight size={16} color={colors.primary} />
        </Pressable>
      </View>
      <View style={styles.metrics}>
        <View style={styles.metric}>
          <View style={styles.headingRow}><Text style={styles.label}>ACTIVE NOW</Text><View style={styles.dot} /></View>
          <Text style={styles.value}>{available ? overview.working : "—"}</Text>
          <Text style={[styles.description, { color: colors.primary }]}>Currently working</Text>
        </View>
        <View style={styles.metric}>
          <View style={styles.headingRow}><Text style={styles.label}>COMPLETED</Text><CircleCheck size={16} color={colors.primary} /></View>
          <Text style={styles.value}>{available ? overview.completed : "—"}</Text>
          <Text style={styles.description}>Shifts fulfilled</Text>
        </View>
      </View>
      <Text accessibilityRole={error ? "alert" : undefined} style={styles.description}>
        {error ? "Attendance could not be loaded. Pull down to retry." : `${dateLabel ?? "Daily check-ins"} · Nepal time (UTC+5:45)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 16, gap: 14, borderWidth: 1, borderColor: colors.border, boxShadow: "0 4px 12px rgba(23,23,23,0.04)" },
  attention: { backgroundColor: colors.primarySoft, borderColor: colors.primaryBorder },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 6 },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: "700", letterSpacing: -0.3, color: colors.ink },
  description: { fontSize: 13, lineHeight: 19, color: colors.muted },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: colors.primary },
  badgeText: { color: colors.surface, fontSize: 10, lineHeight: 14, fontWeight: "700" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  link: { flexDirection: "row", alignItems: "center", minHeight: 48, gap: 2 },
  linkText: { color: colors.primary, fontWeight: "600", fontSize: 12 },
  metrics: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  metric: { flex: 1, minWidth: 120, borderRadius: 12, backgroundColor: colors.surfaceMuted, padding: 14, gap: 8 },
  label: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: "700", letterSpacing: 0.8 },
  value: { fontSize: 34, lineHeight: 40, fontWeight: "800", letterSpacing: -1, color: colors.ink, fontVariant: ["tabular-nums"] },
});
