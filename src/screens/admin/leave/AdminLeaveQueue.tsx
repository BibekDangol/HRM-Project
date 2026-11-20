import { Pagination } from "@/src/components/lists/Pagination";
import { HomeScreenHeader } from "@/src/components/navigation/header/AppHeader";
import EmptyState from "@/src/components/states/EmptyState";
import LoadingState from "@/src/components/states/LoadingState";
import { useLeaveView } from "@/src/hooks/admin/useLeaveView";
import { fetchLeaveRequests, type Leave, type LeaveStatus } from "@/src/services/leave.service";
import { useLeaveTabStore } from "@/src/store/useLeaveTabStore";
import { formatDate } from "@/src/utils/calendar.utils";
import { formatDays } from "@/src/utils/leaveUtils";
import { colors } from "@/theme/colors";
import { useRouter } from "expo-router";
import { ArrowRight, CalendarDays, CalendarRange, CheckCheck, Clock3, FileText } from "lucide-react-native";
import { useRef } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const STATUS = {
  pending: { label: "Pending", color: colors.warningText, background: colors.warningSoft },
  approved: { label: "Approved", color: colors.primary, background: colors.primarySoft },
  rejected: { label: "Rejected", color: colors.dangerText, background: colors.dangerSoft },
};
const TABS: LeaveStatus[] = ["pending", "approved", "rejected"];
const DETAIL_PATHS = {
  pending: "/(admin)/(main-tabs)/leave/pending-details",
  approved: "/(admin)/(main-tabs)/leave/approved-details",
  rejected: "/(admin)/(main-tabs)/leave/rejected-details",
} as const;

export default function AdminLeaveQueue() {
  const router = useRouter();
  const listRef = useRef<FlatList>(null);
  const activeTab = useLeaveTabStore((state) => state.activeTab);
  const setActiveTab = useLeaveTabStore((state) => state.setActiveTab);
  const queue = useLeaveView({ fetchLeaves: fetchLeaveRequests, scrollRef: listRef, activeTab });

  const selectTab = (tab: LeaveStatus) => {
    queue.setPage(1);
    setActiveTab(tab);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };
  const openRequest = (leave: Leave) => {
    router.push({ pathname: DETAIL_PATHS[leave.status], params: { id: leave.id } });
  };

  return (
    <View style={styles.screen}>
      <FlatList
        ref={listRef}
        data={queue.loading ? [] : queue.paginatedLeaves}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshing={queue.refreshing}
        onRefresh={queue.onRefresh}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.fullBleed}><HomeScreenHeader /></View>
            <View style={styles.heading}>
              <View style={styles.titleGroup}><Text style={styles.eyebrow}>TIME OFF MANAGEMENT</Text><Text accessibilityRole="header" style={styles.title}>Leave requests</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open organization calendar" onPress={() => router.push("/(admin)/(main-tabs)/more/holidays")} style={({ pressed }) => [styles.calendarButton, { backgroundColor: pressed ? colors.primarySoft : colors.surface }]}><CalendarDays size={20} color={colors.primary} /></Pressable>
            </View>
            <View style={styles.hero}>
              <View style={styles.heroTop}><View style={styles.heroIcon}><Clock3 size={20} color={colors.primaryBorder} /></View><Text style={styles.heroEyebrow}>APPROVAL QUEUE</Text></View>
              <View style={styles.heroMetric}><Text style={styles.heroNumber}>{queue.loading ? "—" : queue.counts.pending}</Text><View style={styles.heroCopy}><Text style={styles.heroTitle}>Awaiting your review</Text><Text style={styles.heroDescription}>Review your team’s time off requests.</Text></View></View>
              <View style={styles.heroFooter}><CheckCheck size={16} color={colors.successBright} /><Text style={styles.heroDescription}>{queue.loading ? "Loading request summary…" : `${queue.counts.approved} approved · ${queue.counts.rejected} rejected`}</Text></View>
            </View>
            <View accessibilityRole="tablist" style={styles.tabs}>
              {TABS.map((tab) => {
                const selected = activeTab === tab;
                return (
                  <Pressable key={tab} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => selectTab(tab)} style={({ pressed }) => [styles.tab, selected && styles.selectedTab, { opacity: pressed ? 0.65 : 1 }]}>
                    <Text style={[styles.tabText, selected && styles.selectedText]}>{STATUS[tab].label}</Text>
                    <View style={[styles.tabCount, selected && { backgroundColor: colors.primarySoft }]}><Text style={[styles.countText, selected && styles.selectedText]}>{queue.loading ? "—" : queue.counts[tab]}</Text></View>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.heading}><Text style={styles.eyebrow}>{STATUS[activeTab].label.toUpperCase()} REQUESTS</Text><Text style={styles.meta}>{queue.loading ? "Loading…" : `${queue.counts[activeTab]} ${queue.counts[activeTab] === 1 ? "request" : "requests"}`}</Text></View>
          </View>
        }
        renderItem={({ item }) => <LeaveRequestCard leave={item as Leave} onPress={() => openRequest(item as Leave)} />}
        ListEmptyComponent={queue.loading ? <LoadingState message="Loading leave requests…" /> : <EmptyState icon={<FileText size={30} color={colors.primary} />} title={activeTab === "pending" ? "You’re all caught up" : `No ${activeTab} requests`} message={activeTab === "pending" ? "New leave requests will appear here for your review." : `There are no ${activeTab} leave requests to show.`} />}
        ListFooterComponent={queue.shouldShowPagination && !queue.loading ? <Pagination page={queue.page} totalPages={queue.totalPages} pageNumbers={queue.pageNumbers} setPage={(page) => { queue.setPage(page); listRef.current?.scrollToOffset({ offset: 0, animated: true }); }} /> : null}
      />
    </View>
  );
}

function LeaveRequestCard({ leave, onPress }: { leave: Leave; onPress: () => void }) {
  const status = STATUS[leave.status] ?? STATUS.pending;
  const name = [leave.first_name, leave.last_name].filter(Boolean).join(" ") || "Employee";
  const dateRange = `${formatDate(leave.start_date)}${leave.end_date && leave.end_date !== leave.start_date ? ` – ${formatDate(leave.end_date)}` : ""}`;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`View ${name}’s ${status.label.toLowerCase()} leave request`} onPress={onPress} style={({ pressed }) => [styles.card, { backgroundColor: pressed ? colors.primarySoft : colors.surface }]}>
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.initials}>{`${leave.first_name?.[0] ?? ""}${leave.last_name?.[0] ?? ""}`.toUpperCase() || "?"}</Text></View>
        <View style={styles.person}><Text style={styles.name}>{name}</Text><Text style={styles.meta}>{leave.leave_type_name || leave.leave_types?.name || "Leave request"}</Text></View>
        <View style={[styles.status, { backgroundColor: status.background }]}><View style={[styles.dot, { backgroundColor: status.color }]} /><Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text></View>
      </View>
      <View style={styles.datePanel}>
        <CalendarRange size={18} color={colors.primary} />
        <View style={styles.dateCopy}><Text style={styles.dateLabel}>{dateRange}</Text><Text style={styles.meta}>{leave.start_date.slice(0, 4)}{leave.end_date && leave.start_date.slice(0, 4) !== leave.end_date.slice(0, 4) ? ` – ${leave.end_date.slice(0, 4)}` : ""}</Text></View>
        <View style={styles.duration}><Text style={styles.durationValue}>{leave.days_count == null ? "—" : formatDays(leave.days_count)}</Text><Text style={styles.meta}>{leave.days_count === 1 ? "day" : "days"}</Text></View>
      </View>
      {leave.reason ? <Text style={styles.reason} numberOfLines={2}>{leave.reason}</Text> : null}
      <View style={styles.cardFooter}><Text style={styles.footerHint}>{leave.status === "pending" ? "Awaiting a decision" : `${status.label} request`}</Text><View style={styles.link}><Text style={styles.linkText}>{leave.status === "pending" ? "Review request" : "View details"}</Text><ArrowRight size={16} color={colors.primary} /></View></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  list: { paddingHorizontal: 16, paddingBottom: 128 },
  separator: { height: 12 },
  header: { gap: 18, paddingBottom: 16 },
  fullBleed: { marginHorizontal: -16 },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  titleGroup: { flex: 1, gap: 5 },
  eyebrow: { color: colors.subtle, fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 26, lineHeight: 33, fontWeight: "700", letterSpacing: -0.7 },
  calendarButton: { minHeight: 48, width: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  hero: { backgroundColor: colors.ink, borderRadius: 24, padding: 20, gap: 16, boxShadow: "0 6px 16px rgba(23,23,23,0.1)" },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  heroIcon: { width: 34, height: 34, backgroundColor: colors.onPrimaryWash, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  heroEyebrow: { color: colors.primaryBorder, fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 1.2 },
  heroMetric: { flexDirection: "row", alignItems: "center", gap: 16 },
  heroNumber: { fontSize: 48, lineHeight: 56, fontWeight: "800", color: colors.surface, letterSpacing: -1.5, fontVariant: ["tabular-nums"] },
  heroCopy: { flex: 1, gap: 4 },
  heroTitle: { fontSize: 17, lineHeight: 23, color: colors.surface, fontWeight: "600" },
  heroDescription: { fontSize: 12, lineHeight: 18, color: colors.primaryBorder },
  heroFooter: { flexDirection: "row", alignItems: "center", gap: 7, paddingTop: 12, borderTopWidth: 1, borderColor: colors.onPrimaryBorderSoft },
  tabs: { flexDirection: "row", backgroundColor: colors.surfaceMuted, padding: 4, gap: 3, borderRadius: 14 },
  tab: { flex: 1, flexDirection: "row", flexWrap: "wrap", minHeight: 48, gap: 5, alignItems: "center", justifyContent: "center", paddingVertical: 8, paddingHorizontal: 4, borderRadius: 10 },
  selectedTab: { backgroundColor: colors.surface, boxShadow: "0 2px 6px rgba(23,23,23,0.06)" },
  tabText: { fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.muted },
  selectedText: { color: colors.primary },
  tabCount: { borderRadius: 999, backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 2 },
  countText: { fontSize: 10, lineHeight: 14, color: colors.muted, fontWeight: "700" },
  meta: { fontSize: 11, lineHeight: 17, color: colors.subtle },
  card: { padding: 16, gap: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, boxShadow: "0 4px 12px rgba(23,23,23,0.04)" },
  identity: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 },
  avatar: { width: 44, height: 44, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  initials: { color: colors.primary, fontSize: 15, lineHeight: 21, fontWeight: "700" },
  person: { flex: 1, minWidth: 100, gap: 3 },
  name: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: "700", letterSpacing: -0.3 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 999 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, lineHeight: 14, fontWeight: "600" },
  datePanel: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, backgroundColor: colors.surfaceMuted },
  dateCopy: { flex: 1, gap: 3 },
  dateLabel: { color: colors.ink, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  duration: { alignItems: "center", borderLeftWidth: 1, borderColor: colors.border, paddingLeft: 14, minWidth: 44 },
  durationValue: { color: colors.primary, fontSize: 20, lineHeight: 26, fontWeight: "700" },
  reason: { fontSize: 12, lineHeight: 19, color: colors.muted },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, minHeight: 32, paddingTop: 12, borderTopWidth: 1, borderColor: colors.border },
  footerHint: { fontSize: 10, lineHeight: 16, color: colors.subtle },
  link: { flexDirection: "row", alignItems: "center", gap: 6 },
  linkText: { color: colors.primary, fontSize: 12, lineHeight: 18, fontWeight: "600" },
});
