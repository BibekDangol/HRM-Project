import AppButton from "@/src/components/ui/AppButton";
import type { AdminDashboardOverview } from "@/src/services/admin/dashboard.service";
import { colors } from "@/theme/colors";
import tw from "@/theme/tw";
import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  overview: AdminDashboardOverview | null;
  loading: boolean;
  error: boolean;
  onReviewLeaves: () => void;
  onViewAttendance: () => void;
};

export default function AdminOverview({ overview, loading, error, onReviewLeaves, onViewAttendance }: Props) {
  const available = !loading && !error && overview != null;
  const dateLabel = overview && new Date(`${overview.date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", timeZone: "UTC",
  });

  return (
    <View style={tw`gap-4 mb-5`}>
      <Text accessibilityRole="header" style={tw`text-lg font-semibold text-ink`}>
        Needs your attention
      </Text>
      {loading && <ActivityIndicator accessibilityLabel="Loading dashboard counts" color={colors.primary} />}
      {error && (
        <Text accessibilityRole="alert" style={tw`text-sm text-dangerText`}>
          Dashboard counts could not be loaded. Pull down to retry.
        </Text>
      )}
      <View style={tw`rounded-xl border border-border bg-surface p-4 gap-3`}>
        <Text style={tw`text-base font-semibold text-ink`}>Pending approvals</Text>
        <Text style={tw`text-3xl font-bold text-ink`}>{available ? overview.pendingLeaves : "—"}</Text>
        <Text style={tw`text-sm text-muted`}>
          {available && overview.pendingLeaves === 0 ? "All caught up. No leave requests waiting for review." : "Leave requests waiting for review"}
        </Text>
        <AppButton title="Review requests" onPress={onReviewLeaves} fullWidth />
      </View>
      <View style={tw`rounded-xl border border-border bg-surface p-4 gap-3`}>
        <Text style={tw`text-base font-semibold text-ink`}>Today’s attendance</Text>
        {available && <Text style={tw`text-sm text-muted`}>{dateLabel} · Nepal time</Text>}
        <View style={tw`flex-row flex-wrap gap-4`}>
          {[
            { label: "Currently working", value: overview?.working },
            { label: "Completed", value: overview?.completed },
          ].map((item) => (
            <View key={item.label} style={{ flexBasis: 120, flexGrow: 1, gap: 4 }}>
              <Text style={tw`text-2xl font-bold text-ink`}>{available ? item.value : "—"}</Text>
              <Text style={tw`text-sm text-muted`}>{item.label}</Text>
            </View>
          ))}
        </View>
        <Text style={tw`text-sm text-muted`}>Refresh to see the latest check-ins and completed sessions.</Text>
        <AppButton title="View attendance" variant="secondary" onPress={onViewAttendance} fullWidth />
      </View>
    </View>
  );
}
