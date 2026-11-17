import { fontSizes, lineHeights } from "@/theme/typography";
import type { LeaveTypeWithStats } from "@/src/types/userLeave";
import { formatDays } from "@/src/utils/leaveUtils";
import { colors } from "@/theme/colors";
import tw from "@/theme/tw";
import { Text, View } from "react-native";

type Props = {
  days: number | null;
  leaveType: LeaveTypeWithStats | null;
  loading: boolean;
};

export function LeaveRequestSummary({ days, leaveType, loading }: Props) {
  const balanceAfterRequest = leaveType && days != null
    ? leaveType.remaining - days
    : null;
  const exceedsBalance = balanceAfterRequest != null && balanceAfterRequest < 0;

  return (
    <View style={tw`rounded-xl border border-border bg-surface p-4 gap-2`}>
      <Text style={tw`text-description font-semibold text-muted`}>Request summary</Text>
      <Text style={tw`text-section font-bold text-ink`}>
        {days == null ? "Choose your dates" : days === 0.5 ? "Half day" : `${formatDays(days)} ${days === 1 ? "day" : "days"}`}
        {leaveType ? ` · ${leaveType.name ?? "Leave"}` : ""}
      </Text>
      <Text style={tw`text-description text-muted`}>
        {loading ? "Loading available balance…" : leaveType
          ? `Available: ${formatDays(leaveType.remaining)} ${leaveType.remaining === 1 ? "day" : "days"}`
          : "Choose a leave type to see your available balance."}
      </Text>
      {!loading && balanceAfterRequest != null && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontSize: fontSizes.label, lineHeight: lineHeights.label, fontWeight: "600", color: exceedsBalance ? colors.danger : colors.ink }}
        >
          {exceedsBalance
            ? `Exceeds your balance by ${formatDays(-balanceAfterRequest)} ${balanceAfterRequest === -1 ? "day" : "days"}. Shorten the request or choose another leave type.`
            : `After this request: ${formatDays(balanceAfterRequest)} ${balanceAfterRequest === 1 ? "day" : "days"} remaining`}
        </Text>
      )}
      <Text style={tw`text-description text-muted`}>
        Duration includes weekends and holidays. Available balance accounts for pending requests.
      </Text>
    </View>
  );
}
