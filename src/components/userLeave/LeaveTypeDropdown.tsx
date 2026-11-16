import { colors } from "@/theme/colors";
import { LeaveTypeRow, LeaveTypeWithStats } from "@/src/types/userLeave";
import { TW } from "@/theme/twStyles";
import { ChevronDown, X } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type LayoutRectangle,
} from "react-native";
import tw from "@/theme/tw";

export function LeaveTypeDropdown({
  value,
  onChange,
  leaveTypes,
  loading,
  onRefresh,
  showStats = true,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  leaveTypes: LeaveTypeRow[] | LeaveTypeWithStats[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
  showStats?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<LayoutRectangle | null>(
    null,
  );
  const triggerRef = useRef<View>(null);

  const currentLabel = useMemo(() => {
    if (value == null) return null;
    return leaveTypes.find((t) => t.id === value)?.name ?? null;
  }, [value, leaveTypes]);

  const selectedStats = useMemo(() => {
    if (value == null) return null;
    const found = leaveTypes.find((t) => t.id === value);
    if (!found || !("remaining" in found)) return null;
    return found as LeaveTypeWithStats;
  }, [value, leaveTypes]);

  const hasStats = (
    item: LeaveTypeRow | LeaveTypeWithStats,
  ): item is LeaveTypeWithStats => "approvedUsed" in item;

  const handleOpen = () => {
    if (loading) return;
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  const handleSelect = (id: number | null) => {
    onChange(id);
    setOpen(false);
  };

  const remaining = selectedStats?.remaining ?? null;
  const pillBg =
    remaining == null
      ? colors.border
      : remaining === 0
        ? colors.dangerSoft
        : remaining <= 2
          ? colors.accentSoft
          : colors.successSoft;
  const pillText =
    remaining == null
      ? colors.subtle
      : remaining === 0
        ? colors.danger
        : remaining <= 2
          ? colors.warningText
          : colors.successText;

  return (
    <View>
      {/* ── Trigger — styled like a TextInput field ── */}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Leave type: ${currentLabel || "Not selected"}`}
          aria-expanded={open}
          accessibilityState={{ expanded: open, disabled: loading }}
          disabled={loading}
          onPress={handleOpen}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: open ? TW.bgSecondary : colors.border,
            backgroundColor: open ? colors.canvas : colors.surface,
            opacity: pressed || loading ? 0.8 : 1,
            minHeight: 48,
          })}
        >
          {/* Floating label */}
          <View style={{ flex: 1 }}>
            {currentLabel ? (
              <>
                {/* <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: open ? TW.bgSecondary : colors.subtle,
                    letterSpacing: 0.3,
                    marginBottom: 3,
                  }}
                >
                  Leave Type
                </Text> */}
                <Text style={tw`text-[15px] font-semibold text-slate-600`}>
                  {currentLabel}
                </Text>
              </>
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "400",
                  color: colors.subtle,
                }}
              >
                {loading ? "Loading..." : "Select leave type"}
              </Text>
            )}
          </View>

          {/* Right side controls */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {remaining != null && (
              <View
                style={{
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 20,
                  backgroundColor: pillBg,
                }}
              >
                <Text
                  style={{ fontSize: 13, fontWeight: "700", color: pillText }}
                >
                  {remaining} left
                </Text>
              </View>
            )}

            {value != null && !loading && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Clear leave type"
                onPress={(event) => { event.stopPropagation(); handleSelect(null); }}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.surfaceMuted,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <X size={18} color={colors.muted} strokeWidth={2.5} />
              </Pressable>
            )}

            <ChevronDown
              size={17}
              color={open ? TW.bgSecondary : colors.subtle}
              strokeWidth={2.5}
              style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
            />
          </View>
        </Pressable>
      </View>

      {/* Stats row below trigger — only when selected */}

      {/* ── Overlay dropdown ── */}
      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          {triggerLayout && (
            <View
              style={{
                position: "absolute",
                top: triggerLayout.y + triggerLayout.height + 4,
                left: triggerLayout.x,
                width: triggerLayout.width,
                backgroundColor: colors.surface,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: colors.border,
                maxHeight: 320,
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.08,
                shadowRadius: 20,
                elevation: 10,
                overflow: "hidden",
              }}
            >
              <Pressable onPress={() => {}}>
                <ScrollView
                  bounces={false}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {leaveTypes.length === 0 ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                      <Text style={{ fontSize: 13, color: colors.subtle }}>
                        No leave types available.
                      </Text>
                    </View>
                  ) : (
                    leaveTypes.map((t, index) => {
                      const isSelected = value === t.id;
                      const stats = showStats && hasStats(t) ? t : null;
                      const rem = stats?.remaining ?? null;

                      const rowPillBg =
                        rem == null
                          ? colors.border
                          : rem === 0
                            ? colors.dangerSoft
                            : rem <= 2
                              ? colors.accentSoft
                              : colors.successSoft;
                      const rowPillText =
                        rem == null
                          ? colors.subtle
                          : rem === 0
                            ? colors.danger
                            : rem <= 2
                              ? colors.warningText
                              : colors.successText;

                      return (
                        <Pressable
                          key={t.id}
                          onPress={() => handleSelect(t.id)}
                          style={({ pressed }) => ({
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 14,
                            paddingVertical: 13,
                            borderBottomWidth:
                              index < leaveTypes.length - 1 ? 1 : 0,
                            borderBottomColor: colors.surfaceMuted,
                            backgroundColor: isSelected
                              ? `${TW.bgSecondary}0D`
                              : pressed
                                ? colors.canvas
                                : colors.surface,
                          })}
                        >
                          {/* Avatar */}
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 10,
                              backgroundColor: isSelected
                                ? TW.bgSecondary
                                : colors.primarySoft,
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isSelected ? colors.surface : TW.bgSecondary,
                              }}
                            >
                              {(t.name ?? "?")[0].toUpperCase()}
                            </Text>
                          </View>

                          {/* Name + sub */}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: isSelected ? "700" : "500",
                                color: TW.bgSecondary,
                              }}
                            >
                              {t.name ?? "Unnamed"}
                            </Text>
                            {stats != null && (
                              <Text
                                style={{
                                  fontSize: 13,
                                  color: colors.subtle,
                                  marginTop: 2,
                                }}
                              >
                                {stats.approvedUsed} used · {stats.pending}{" "}
                                pending
                              </Text>
                            )}
                          </View>

                          {/* Remaining pill */}
                          {stats != null && (
                            <View
                              style={{
                                paddingHorizontal: 8,
                                paddingVertical: 3,
                                borderRadius: 20,
                                backgroundColor: rowPillBg,
                                marginLeft: 8,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "700",
                                  color: rowPillText,
                                }}
                              >
                                {rem} left
                              </Text>
                            </View>
                          )}
                        </Pressable>
                      );
                    })
                  )}
                </ScrollView>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}
