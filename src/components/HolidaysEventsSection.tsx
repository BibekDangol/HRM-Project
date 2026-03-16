import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { ChevronRight } from "lucide-react-native";
import tw from "twrnc";
import { TW } from "@/theme/twStyles";

export type CalendarItem = {
  id: string;
  title: string;
  type: "holiday" | "event";
  start_date: string;
  end_date?: string | null;
  color: string;
};

type Props = {
  calendarItems: CalendarItem[];
  calendarLoading: boolean;
  monthTitle: string;
  selectedYear: number;
  onViewAll: () => void;
  onCardPress?: (item: CalendarItem) => void;
};

const FIXED_COLOR = "#F7A44B";
const CARD_RADIUS = 20;
const MAX_VISIBLE = 5; // max cards shown before "View All"

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  onViewAll,
  onCardPress,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();

  // 32 = px-2 (8*2) on the outer View + p-4 (16*2) from parent ScrollView
  const cardWidth = screenWidth - 32;

  const scrollRef = useRef<ScrollView>(null);

  // ── Slice to MAX_VISIBLE ──────────────────────────────────────
  const visibleItems = calendarItems.slice(0, MAX_VISIBLE);
  const total = visibleItems.length;
  const hasMore = calendarItems.length > MAX_VISIBLE;
  // ──────────────────────────────────────────────────────────────

  // Real-time index from scroll position
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [calendarItems]);

  // Update dot index immediately as scroll moves
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / cardWidth);
    const clamped = Math.max(0, Math.min(idx, total - 1));
    if (clamped !== currentIndex) setCurrentIndex(clamped);
  };

  // ── Idle chevron bounce ───────────────────────────────────────
  const chevronX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  const startLoop = () => {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.delay(1000),
        Animated.timing(chevronX, {
          toValue: 8,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.delay(80),
        Animated.timing(chevronX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loopRef.current.start();
  };

  const stopLoop = () => {
    loopRef.current?.stop();
    loopRef.current = null;
    chevronX.setValue(0);
  };

  useEffect(() => {
    if (total > 1) startLoop();
    return () => stopLoop();
  }, [total]);
  // ──────────────────────────────────────────────────────────────

  const formatMonthDay = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const day = date.getDate().toString().padStart(2, "0");
    return { month, day };
  };

  const formatWeekday = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });

  const getAccent = (item: CalendarItem) =>
    item.color ? item.color : item.type === "holiday" ? "#EF4444" : "#3B82F6";

  return (
    <View style={tw`mt-5 px-2`}>
      {/* ── Header ── */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <View style={tw`flex-row items-center gap-2`}>
          <Text style={tw`text-lg font-bold text-[#0F172A]`}>
            Holidays &amp; Events
          </Text>

          {/* Counter badge — real-time */}
        </View>

        {/* View All */}
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 3,
            opacity: pressed ? 0.55 : 1,
            paddingVertical: 4,
            paddingHorizontal: 2,
          })}
        >
          <Text style={{ color: TW.bgSecondary, fontSize: 13, fontWeight: "600",  }}>
            View All
            {hasMore ? ` (${calendarItems.length})` : ""}
          </Text>
          <ChevronRight size={14} color={TW.bgSecondary} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* ── Loading ── */}
      {calendarLoading ? (
        <View
          style={[
            tw`bg-white items-center py-8`,
            { borderRadius: CARD_RADIUS },
          ]}
        >
          <Text style={tw`text-gray-400 text-sm`}>Loading…</Text>
        </View>
      ) : total === 0 ? (
        /* ── Empty ── */
        <View
          style={[
            tw`bg-white items-center py-8`,
            { borderRadius: CARD_RADIUS },
          ]}
        >
          <Text style={tw`text-gray-600 text-sm`}>No holidays or events</Text>
        </View>
      ) : (
        <>
          {/* ── Swipeable carousel ── */}
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={cardWidth}
            snapToAlignment="start"
            scrollEventThrottle={16} // fires frequently for real-time dots
            onScroll={handleScroll} // ← real-time, not momentum end
            onScrollEndDrag={handleScroll} // ← catches slow drags that stop
            onMomentumScrollEnd={handleScroll} // ← final snap position
          >
            {visibleItems.map((item, index) => {
              const accent = getAccent(item);
              const bg = accent + "18";
              const isCurrentCard = index === currentIndex;

              return (
                <View
                  key={item.id}
                  style={{
                    width: cardWidth,
                    borderRadius: CARD_RADIUS,
                    overflow: "hidden",
                    backgroundColor: "#FFFFFF",
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: accent,
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}
                >
                  {/* Left accent bar — REMOVED */}

                  {/* Date box */}
                  <View
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 16,
                      backgroundColor: bg,
                      alignItems: "center",
                      justifyContent: "center",
                      margin: 16,
                    }}
                  >
                    <Text
                      style={{
                        color: accent,
                        fontSize: 13,
                        fontWeight: "600",
                        letterSpacing: 0.5,
                      }}
                    >
                      {formatMonthDay(item.start_date).month}
                    </Text>
                    <Text
                      style={{
                        color: accent,
                        fontSize: 28,
                        fontWeight: "800",
                        lineHeight: 32,
                      }}
                    >
                      {formatMonthDay(item.start_date).day}
                    </Text>
                  </View>

                  {/* Text */}
                  <View style={{ flex: 1, paddingVertical: 16 }}>
                    <Text
                      style={{
                        color: "#1B4A5A",
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}
                      numberOfLines={1}
                    >
                      {formatWeekday(item.start_date)} •{" "}
                      <Text style={{ color: accent, fontWeight: "600" }}>
                        {item.type === "holiday" ? "National Holiday" : "Event"}
                      </Text>
                    </Text>
                  </View>

                  {/* Chevron */}
                  {isCurrentCard && total > 1 ? (
                    <Animated.View
                      style={{
                        marginRight: 14,
                        transform: [{ translateX: chevronX }],
                      }}
                    >
                      <ChevronRight
                        size={24}
                        color={accent}
                        strokeWidth={2.5}
                      />
                    </Animated.View>
                  ) : (
                    <View style={{ marginRight: 14 }}>
                      <ChevronRight
                        size={24}
                        color="#CBD5E1"
                        strokeWidth={1.8}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* ── Dot indicators — real-time ── */}
          {total > 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
              }}
            >
              {visibleItems.map((item, i) => (
                <View
                  key={i}
                  style={{
                    width: i === currentIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === currentIndex ? getAccent(item) : "#E2E8F0",
                  }}
                />
              ))}

              {/* Extra dot hinting more items exist */}
              {hasMore && (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#E2E8F0",
                    opacity: 0.5,
                  }}
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};
