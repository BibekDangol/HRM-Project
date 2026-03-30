import { Clock, Pencil } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export function LeaveCard({ item, leaveTypeName, router, activeTab }: any) {
  const STATUS_CONFIG: {
    [key: string]: { label: string; color: string; bg: string; border: string };
  } = {
    approved: {
      label: "APPROVED",
      color: "#008080",
      bg: "#E6F4F4",
      border: "#008080",
    },
    pending: {
      label: "PENDING",
      color: "#D97706",
      bg: "#FFFBEB",
      border: "#D97706",
    },
    rejected: {
      label: "REJECTED",
      color: "#DC2626",
      bg: "#FEF2F2",
      border: "#DC2626",
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
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}>
      {/* {leaveTypeName(item.leave_type_id)} */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "8",
          justifyContent: "space-between",
        }}>
        {/* Left: type name + date range */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              color: "#0F172A",
              fontSize: 16,
              fontWeight: "700",
            }}
            numberOfLines={1}>
            {leaveTypeName(item.leave_type_id)}
          </Text>
          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              marginTop: 3,
            }}>
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
            }}>
            <View
              style={{
                backgroundColor: cfg.bg,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: cfg.border,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}>
              <Text
                style={{
                  color: cfg.color,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.5,
                }}>
                {cfg.label}
              </Text>
            </View>
          </View>
          {/* edit button */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {canEdit && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/(users)/leaves/edit",
                    params: { leaveId: item.id },
                  })
                }
                hitSlop={12}
                style={({ pressed }) => [
                  tw`w-10 h-10 rounded-full items-center justify-center ${TW.bgAction}/90`,
                  pressed && tw`opacity-70`,
                ]}>
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
          backgroundColor: "#F1F5F9",
          marginVertical: 12,
        }}
      />

      {/* Applied on */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}>
        <Clock size={13} color="#94A3B8" strokeWidth={1.8} />

        <Text style={{ color: "#94A3B8", fontSize: 12 }}>
          Applied on:{" "}
          {item.created_at ? formatDate(item.created_at.split("T")[0]) : "—"}
        </Text>
      </View>
    </View>
  );
}
