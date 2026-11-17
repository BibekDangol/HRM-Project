import { colors } from "@/theme/colors";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Props, StatusInfo } from "../types/activitylog";

import { useAttendanceContext } from "@/src/context/AttendanceContext";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ActivityRecord } from "@/src/types/Calendar";
import { normalize } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

export const ActivityLogSection = ({ onViewAll, hideTitle }: Props) => {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;
  const { attendance } = useAttendanceContext();

  const [activityLog, setActivityLog] = useState<ActivityRecord[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const hasViewAll = Boolean(onViewAll);
  useEffect(() => {
    let active = true;

    const fetchActivityLog = async () => {
      if (!userId) {
        setActivityLog([]);
        setInitialLoading(false);
        return;
      }
      setRefreshing(true);

      try {
        const fmt = (d: Date) =>
          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate(),
          ).padStart(2, "0")}`;

        let query = supabase
          .from("attendance")
          .select(
            "id, date, status, check_in_time, check_out_time, check_in_comment",
          )
          .eq("user_id", userId)
          .order("date", { ascending: false });

        if (hasViewAll) {
          const today = new Date();
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
          query = query.gte("date", fmt(sevenDaysAgo)).lte("date", fmt(today)).limit(2);
        }

        const { data, error } = await query;
        if (error) throw error;

        if (active) setActivityLog((data ?? []) as ActivityRecord[]);
      } catch (e) {
        if (active) console.log("Activity log error:", e instanceof Error ? e.message : e);
      } finally {
        if (active) {
          setInitialLoading(false);
          setRefreshing(false);
        }
      }
    };

    void fetchActivityLog();
    return () => { active = false; };
  }, [userId, hasViewAll, attendance]);

  const fmtTime = (t: string | null) => {
    if (!t) return "—";
    return new Date(t).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const fmtDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) {
      if (!checkOut && checkIn) return "checkout missing";
      return "no record";
    }

    const diffMs = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const totalMins = Math.floor(diffMs / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;

    return `${h}h ${m}m`;
  };

  const fmtDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return {
      dayNum: date.getDate().toString().padStart(2, "0"),
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
  };

  const getStatus = (record: ActivityRecord): StatusInfo => {
    const s = normalize(record.status);
    const isLate = normalize(record.check_in_comment ?? "") !== "";
    const isAbsent = s === "absent";
    const isIncomplete = s === "incomplete";

    if (isLate) {
      return {
        label: "Late",
        dotColor: colors.accent,
        badgeBg: colors.accentSoft,
        badgeText: colors.warningText,
      };
    }

    if (isAbsent) {
      return {
        label: "Absent",
        dotColor: colors.danger,
        badgeBg: colors.dangerSoft,
        badgeText: colors.dangerText,
      };
    }

    if (isIncomplete) {
      return {
        label: "Incomplete",
        dotColor: colors.warning,
        badgeBg: colors.warningSoft,
        badgeText: colors.warningText,
      };
    }

    return {
      label: "Present",
      dotColor: colors.success,
      badgeBg: colors.successSoft,
      badgeText: colors.successText,
    };
  };

  const SkeletonRow = () => (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        backgroundColor: colors.canvas,
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 0.5,
        borderColor: colors.border,
        marginBottom: 8,
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: 44,
          backgroundColor: colors.surfaceMuted,
          borderRadius: 8,
          paddingVertical: 6,
          paddingHorizontal: 4,
          gap: 3,
        }}
      >
        <View
          style={{
            width: 22,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            width: 28,
            height: 18,
            borderRadius: 4,
            backgroundColor: colors.borderStrong,
          }}
        />
        <View
          style={{
            width: 18,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.border,
          }}
        />
      </View>

      <View
        style={{
          width: 0.5,
          alignSelf: "stretch",
          backgroundColor: colors.border,
        }}
      />

      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            width: "45%",
            height: 22,
            borderRadius: 999,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            width: "30%",
            height: 9,
            borderRadius: 4,
            backgroundColor: colors.surfaceMuted,
          }}
        />
      </View>

      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View
          style={{
            width: 110,
            height: 11,
            borderRadius: 4,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            width: 50,
            height: 9,
            borderRadius: 4,
            backgroundColor: colors.surfaceMuted,
          }}
        />
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 8 }}>
      {!hideTitle && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text style={tw`font-semibold ${TW.textPrimary} text-lg`}>
            Recent Activity
          </Text>

          {onViewAll && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View all attendance activity"
              onPress={onViewAll}
              style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1,
                paddingVertical: 12,
                minHeight: 48,
                justifyContent: "center",
                paddingHorizontal: 10,
              })}
            >
              <Text
                style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}
              >
                View All
              </Text>
            </Pressable>
          )}
        </View>
      )}
      {initialLoading ? (
        <View>
          {(hasViewAll ? [1, 2] : [1, 2, 3]).map((k) => (
            <SkeletonRow key={k} />
          ))}
        </View>
      ) : activityLog.length === 0 ? (
        <View style={{
          paddingVertical: 32,
          paddingHorizontal: 16,
          alignItems: "center",
          gap: 6,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
        }}>
          <Text style={{ color: colors.ink, fontWeight: "600", fontSize: 14 }}>
            No activity found
          </Text>
          <Text style={{ color: colors.muted, fontSize: 14 }}>
            {onViewAll
              ? "No records in the last 7 days"
              : "No attendance records yet"}
          </Text>
        </View>
      ) : (
        <View style={{ gap: 8, opacity: refreshing ? 0.85 : 1 }}>
          {activityLog.map((record) => {
            const status = getStatus(record);
            const { dayNum, dayName, month } = fmtDate(record.date);
            const duration = fmtDuration(
              record.check_in_time,
              record.check_out_time,
            );

            return (
              <View
                key={record.id}
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  gap: 12,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: colors.border,
                  padding: 12,
                }}
              >
                <View
                  style={{
                    alignItems: "center",
                    width: 44,
                    borderRadius: 8,
                    paddingVertical: 6,
                    paddingHorizontal: 4,
                  }}
                >
                  <Text
                    style={{
                      color: colors.subtle,
                      fontSize: 14,
                      fontWeight: "600",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {month}
                  </Text>

                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 20,
                      fontWeight: "700",
                      lineHeight: 24,
                    }}
                  >
                    {dayNum}
                  </Text>

                  <Text
                    style={{
                      color: colors.subtle,
                      fontSize: 14,
                      fontWeight: "500",
                    }}
                  >
                    {dayName}
                  </Text>
                </View>

                <View
                  style={{
                    width: 0.5,
                    alignSelf: "stretch",
                    backgroundColor: colors.border,
                  }}
                />

                <View style={{ flex: 1, gap: 4 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: status.badgeBg,
                      paddingHorizontal: 9,
                      paddingVertical: 3,
                      borderRadius: 999,
                      alignSelf: "flex-start",
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: status.dotColor,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: status.badgeText,
                      }}
                    >
                      {status.label}
                    </Text>
                  </View>

                  {record.check_in_comment ? (
                    <Text
                      style={{
                        color: colors.subtle,
                        fontSize: 13,
                        lineHeight: 16,
                      }}
                      numberOfLines={2}
                    >
                      {record.check_in_comment}
                    </Text>
                  ) : (
                    <Text
                      style={{
                        color: colors.subtle,
                        fontSize: 13,
                        lineHeight: 16,
                      }}
                    >
                      {record.check_in_time && record.check_out_time
                        ? "Attendance recorded successfully"
                        : "Partial attendance record"}
                    </Text>
                  )}
                </View>

                <View style={{ flexBasis: "100%", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 8 }}>
                  <Text
                    style={{
                      color: colors.ink,
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    {fmtTime(record.check_in_time)} -{" "}
                    {fmtTime(record.check_out_time)}
                  </Text>

                  <Text
                    style={{
                      color: colors.subtle,
                      fontSize: 13,
                      fontWeight: "500",
                    }}
                  >
                    {duration}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};
