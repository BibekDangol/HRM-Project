import { useUsersStore } from "@/src/store/useUsersStore";
import type { CalendarItem } from "@/src/types/Calendar";
import { formatMonthDay, getNepalTodayKey, getSyncedCalendarItems } from "@/src/utils/calendar.utils";
import { colors } from "@/theme/colors";
import { ArrowDown, ArrowRight, CalendarDays, ChevronRight, Clock, ShieldCheck, Users } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

export function AdminDashboardHero() {
  const name = useUsersStore((state) => state.currentUserProfile?.first_name) ?? "Admin";
  const organization = useUsersStore((state) => state.organizationName);
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Kathmandu" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const date = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kathmandu" });
  return (
    <View style={styles.section}>
      <View style={styles.sync}><ArrowDown size={12} color={colors.subtle} /><Text style={styles.small}>Pull down to refresh · Nepal time</Text></View>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.role}><View style={styles.dot} /><Text style={styles.roleText}>ADMIN PORTAL</Text></View>
          <View style={styles.row}><Clock size={12} color={colors.primaryBorder} /><Text style={styles.timezone}>NPT (UTC+5:45)</Text></View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.greeting}>{greeting}, {name}</Text>
          <Text style={styles.heroDate}>{date}</Text>
        </View>
        <View style={styles.heroFooter}><ShieldCheck size={18} color={colors.successBright} /><Text style={styles.organization}>{organization || "Your organization"}</Text><Text style={styles.timezone}>Workspace overview</Text></View>
      </View>
    </View>
  );
}

export function AdminTeamSummary({ count, onViewUsers }: { count: number | null; onViewUsers: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="View employee directory" onPress={onViewUsers} style={({ pressed }) => [styles.card, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.heading}>
        <View style={styles.section}><Text accessibilityRole="header" style={styles.title}>Team overview</Text><Text style={styles.description}>Your people, in one place</Text></View>
        <View style={styles.total}><Text style={styles.count}>{count ?? "—"}</Text><Text style={styles.small}>Total employees</Text></View>
      </View>
      <View style={styles.teamLink}><View style={styles.row}><Users size={19} color={colors.primary} /><Text style={styles.linkText}>Employee directory</Text></View><ChevronRight size={18} color={colors.primary} /></View>
    </Pressable>
  );
}

export function AdminUpcomingEvents({ items, loading, onViewAll }: { items: CalendarItem[]; loading: boolean; onViewAll: () => void }) {
  const today = getNepalTodayKey();
  const upcoming = getSyncedCalendarItems(items, today).slice(0, 2);
  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.row}><CalendarDays size={19} color={colors.primary} /><Text accessibilityRole="header" style={styles.title}>Holidays & events</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="View all holidays and events" onPress={onViewAll} style={({ pressed }) => [styles.viewAll, { opacity: pressed ? 0.6 : 1 }]}><Text style={styles.linkText}>View all</Text><ArrowRight size={14} color={colors.primary} /></Pressable>
      </View>
      {loading ? <ActivityIndicator accessibilityLabel="Loading holidays and events" color={colors.primary} /> : upcoming.length === 0 ? <Text style={styles.description}>No upcoming holidays or events scheduled.</Text> : upcoming.map((item) => {
        const { month, day } = formatMonthDay(item.start_date);
        return (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, ${month} ${day}`} onPress={onViewAll} style={({ pressed }) => [styles.event, { opacity: pressed ? 0.7 : 1 }]}>
            <View style={styles.date}><Text style={styles.month}>{month}</Text><Text style={styles.day}>{day}</Text></View>
            <View style={styles.eventCopy}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.description}>{item.type === "holiday" ? "Holiday" : "Event"}{item.start_date <= today ? " · Happening now" : " · Upcoming"}</Text></View>
            <ChevronRight size={16} color={colors.primary} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 7 },
  sync: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 6 },
  small: { fontSize: 11, lineHeight: 16, color: colors.subtle },
  hero: { borderRadius: 24, backgroundColor: colors.ink, padding: 20, gap: 20, overflow: "hidden", boxShadow: "0 6px 16px rgba(23,23,23,0.12)" },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  role: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, backgroundColor: colors.onPrimaryWash, paddingHorizontal: 10, paddingVertical: 6 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.successBright },
  roleText: { color: colors.primaryBorder, fontWeight: "700", fontSize: 10, lineHeight: 14, letterSpacing: 1 },
  timezone: { color: colors.primaryBorder, fontSize: 10, lineHeight: 15 },
  greeting: { fontSize: 26, lineHeight: 33, fontWeight: "700", color: colors.surface, letterSpacing: -0.8 },
  heroDate: { color: colors.primaryBorder, fontSize: 12, lineHeight: 18 },
  heroFooter: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, backgroundColor: colors.onPrimaryWash, borderRadius: 12, padding: 12 },
  organization: { flex: 1, color: colors.surface, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: colors.border, gap: 14, boxShadow: "0 4px 12px rgba(23,23,23,0.04)" },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 17, lineHeight: 23, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  description: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  total: { alignItems: "flex-end", gap: 2 },
  count: { color: colors.primary, fontSize: 28, lineHeight: 34, fontWeight: "800", fontVariant: ["tabular-nums"] },
  teamLink: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.primarySoft, padding: 14, borderRadius: 12, minHeight: 48 },
  linkText: { fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.primary },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 4, minHeight: 48 },
  event: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, backgroundColor: colors.primarySoft },
  date: { alignItems: "center", justifyContent: "center", width: 48, minHeight: 52, borderRadius: 10, backgroundColor: colors.surface },
  month: { color: colors.primary, fontSize: 10, lineHeight: 14, fontWeight: "700", textTransform: "uppercase" },
  day: { color: colors.ink, fontSize: 20, lineHeight: 24, fontWeight: "800" },
  eventCopy: { flex: 1, gap: 3 },
  eventTitle: { color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: "600" },
});
