import { fontSizes, lineHeights } from "@/theme/typography";
import { colors } from "@/theme/colors";
import { Clock, Pencil } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

export function LeaveCard({ item, leaveTypeName, router, activeTab }: any) {
  const STATUS_CONFIG: {
    [key: string]: { label: string; color: string; bg: string; border: string };
  } = {
    approved: {
      label: "APPROVED",
      color: colors.successText,
      bg: colors.successSoft,
      border: colors.successBorder,
    },
    pending: {
      label: "PENDING",
      color: colors.warningText,
      bg: colors.warningSoft,
      border: colors.warning,
    },
    rejected: {
      label: "REJECTED",
      color: colors.dangerText,
      bg: colors.dangerSoft,
      border: colors.danger,
    },
  };
  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  const status = item.status?.toLowerCase();
  const canEdit = status === "pending" && activeTab === "pending";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: colors.shadow,
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      {/* {leaveTypeName(item.leave_type_id)} */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "8",
          justifyContent: "space-between",
        }}
      >
        {/* Left: type name + date range */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              color: colors.ink,
              fontSize: fontSizes.body, lineHeight: lineHeights.body,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {leaveTypeName(item.leave_type_id)}
          </Text>
          <Text
            style={{
              color: colors.muted,
              fontSize: fontSizes.caption, lineHeight: lineHeights.caption,
              marginTop: 3,
            }}
          >
            {item.start_date} - {item.end_date}
          </Text>
        </View>
        {/* Status */}
        <View style={tw`flex-row gap-4`}>
          {/* status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <View
              style={{
                backgroundColor: cfg.bg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: cfg.border,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: cfg.color,
                  fontSize: fontSizes.caption, lineHeight: lineHeights.caption,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}
              >
                {cfg.label}
              </Text>
            </View>
          </View>
          {/* edit button */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {canEdit && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit pending leave request"
                onPress={() =>
                  router.push({
                    pathname: "/(users)/(main-tabs)/leaves/editLeave",
                    params: { leaveId: item.id },
                  })
                }
                hitSlop={12}
                style={({ pressed }) => [
                  tw`w-12 h-12 rounded-full items-center justify-center ${TW.bgAction}/90`,
                  pressed && tw`opacity-70`,
                ]}
              >
                <Pencil size={18} color={TW.bgPrimary} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.surfaceMuted,
          marginVertical: 12,
        }}
      />

      {/* Applied on */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Clock size={13} color={colors.subtle} strokeWidth={1.8} />

        <Text style={{ color: colors.subtle, fontSize: fontSizes.caption, lineHeight: lineHeights.caption }}>
          Applied on:{" "}
          {item.created_at ? formatDate(item.created_at.split("T")[0]) : "—"}
        </Text>
      </View>
    </View>
  );
}
