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
import tw from "twrnc";

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
      ? "#E2E8F0"
      : remaining === 0
        ? "#FEE2E2"
        : remaining <= 2
          ? "#FEF3C7"
          : "#DCFCE7";
  const pillText =
    remaining == null
      ? "#94A3B8"
      : remaining === 0
        ? "#EF4444"
        : remaining <= 2
          ? "#D97706"
          : "#16A34A";

  return (
    <View>
      {/* ── Trigger — styled like a TextInput field ── */}
      <View ref={triggerRef} collapsable={false}>
        <Pressable
          onPress={handleOpen}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: open ? TW.bgSecondary : "#E2E8F0",
            backgroundColor: open ? "#F8FAFC" : "#ffffff",
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
                    fontSize: 11,
                    fontWeight: "600",
                    color: open ? TW.bgSecondary : "#94A3B8",
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
                  color: "#94A3B8",
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
                  style={{ fontSize: 11, fontWeight: "700", color: pillText }}
                >
                  {remaining} left
                </Text>
              </View>
            )}

            {value != null && !loading && (
              <Pressable
                onPress={() => handleSelect(null)}
                hitSlop={10}
                style={({ pressed }) => ({
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: "#F1F5F9",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <X size={11} color="#64748B" strokeWidth={2.5} />
              </Pressable>
            )}

            <ChevronDown
              size={17}
              color={open ? TW.bgSecondary : "#94A3B8"}
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
                backgroundColor: "#ffffff",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: "#E2E8F0",
                maxHeight: 320,
                shadowColor: "#1B4A5A",
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
                      <Text style={{ fontSize: 13, color: "#94A3B8" }}>
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
                          ? "#E2E8F0"
                          : rem === 0
                            ? "#FEE2E2"
                            : rem <= 2
                              ? "#FEF3C7"
                              : "#DCFCE7";
                      const rowPillText =
                        rem == null
                          ? "#94A3B8"
                          : rem === 0
                            ? "#EF4444"
                            : rem <= 2
                              ? "#D97706"
                              : "#16A34A";

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
                            borderBottomColor: "#F1F5F9",
                            backgroundColor: isSelected
                              ? `${TW.bgSecondary}0D`
                              : pressed
                                ? "#F8FAFC"
                                : "#ffffff",
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
                                : "#F0F4FF",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isSelected ? "#ffffff" : TW.bgSecondary,
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
                                  fontSize: 11,
                                  color: "#94A3B8",
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
                                  fontSize: 11,
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
