import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
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

const CARD_RADIUS = 12;
const MAX_VISIBLE = 5;
const CARD_HEIGHT = 86;
const CARD_GAP = 12;

const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getNepalTodayKey = () => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kathmandu",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
};

const formatMonthDay = (dateString: string) => {
  const date = parseLocalDate(dateString);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
  };
};

const formatWeekday = (dateString: string) =>
  parseLocalDate(dateString).toLocaleDateString("en-US", { weekday: "long" });

const isActiveToday = (item: CalendarItem, todayKey: string) => {
  const endKey = item.end_date ?? item.start_date;
  return item.start_date <= todayKey && endKey >= todayKey;
};

const isUpcoming = (item: CalendarItem, todayKey: string) => {
  const endKey = item.end_date ?? item.start_date;
  return endKey >= todayKey;
};

// ─── Pagination dot ────────────────────────────────────────────────────────────

function PaginationDot({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);
    return {
      width: interpolate(distance, [0, 1], [18, 6], "clamp"),
      opacity: interpolate(distance, [0, 1], [1, 0.55], "clamp"),
      transform: [{ scale: interpolate(distance, [0, 1], [1.05, 1], "clamp") }],
      backgroundColor: interpolateColor(
        distance,
        [0, 1],
        ["#1B4A5A", "#DCE3EA"],
      ),
    };
  });

  return (
    <Animated.View style={[{ height: 6, borderRadius: 999 }, animatedStyle]} />
  );
}

// ─── Date block (static, no highlight dependency) ──────────────────────────────

function CardDateBlock({
  month,
  day,
  dayName,
}: {
  month: string;
  day: string;
  dayName: string;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        width: 44,
        backgroundColor: "#F8FAFC",
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          color: "#94A3B8",
          fontSize: 9,
          fontWeight: "600",
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        {month}
      </Text>
      <Text
        style={{
          color: "#0F172A",
          fontSize: 20,
          fontWeight: "700",
          lineHeight: 24,
        }}
      >
        {day}
      </Text>
      <Text style={{ color: "#94A3B8", fontSize: 9, fontWeight: "500" }}>
        {dayName}
      </Text>
    </View>
  );
}

// ─── Type badge ────────────────────────────────────────────────────────────────

function TypeBadge({ isHoliday }: { isHoliday: boolean }) {
  const badgeBg = isHoliday ? "#FEE2E2" : "#EEF2FF";
  const badgeText = isHoliday ? "#B91C1C" : "#4338CA";
  const badgeDot = isHoliday ? "#EF4444" : "#6366F1";

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: badgeBg,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 999,
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: badgeDot,
        }}
      />
      <Text style={{ fontSize: 11, fontWeight: "600", color: badgeText }}>
        {isHoliday ? "Holiday" : "Event"}
      </Text>
    </View>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard({ cardWidth }: { cardWidth: number }) {
  return (
    <View
      style={{
        width: cardWidth,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: "#F8FAFC",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: 44,
          backgroundColor: "#F1F5F9",
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
            backgroundColor: "#E2E8F0",
          }}
        />
        <View
          style={{
            width: 28,
            height: 18,
            borderRadius: 4,
            backgroundColor: "#CBD5E1",
          }}
        />
        <View
          style={{
            width: 18,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#E2E8F0",
          }}
        />
      </View>
      <View
        style={{
          width: 1,
          alignSelf: "stretch",
          backgroundColor: "#E2E8F0",
          marginVertical: 10,
        }}
      />
      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            width: "65%",
            height: 12,
            borderRadius: 4,
            backgroundColor: "#E2E8F0",
          }}
        />
        <View
          style={{
            width: "40%",
            height: 9,
            borderRadius: 4,
            backgroundColor: "#F1F5F9",
          }}
        />
      </View>
      <View
        style={{
          width: 60,
          height: 24,
          borderRadius: 999,
          backgroundColor: "#E2E8F0",
        }}
      />
    </View>
  );
}

function AnimatedCard({
  item,
  index,
  cardWidth,
  pageWidth,
  progress,
  todayKey,
  onCardPress,
}: {
  item: CalendarItem;
  index: number;
  cardWidth: number;
  pageWidth: number;
  progress: SharedValue<number>;
  todayKey: string;
  onCardPress?: (item: CalendarItem) => void;
}) {
  const { month, day, dayName } = formatMonthDay(item.start_date);
  const isHoliday = item.type === "holiday";
  // ✅ Only today-active cards ever get the highlight colours
  const activeToday = isActiveToday(item, todayKey);

  const cardShellStyle = useAnimatedStyle(() => {
    // Upcoming cards: always plain white — skip interpolation entirely
    if (!activeToday) {
      return {
        backgroundColor: "#FFFFFF",
        borderColor: "#E2E8F0",
      };
    }
    // Today card: fade highlight in when centred
    const dist = Math.abs(progress.value - index);
    return {
      backgroundColor: interpolateColor(dist, [0, 0.6], ["#F0F9FF", "#FFFFFF"]),
      borderColor: interpolateColor(dist, [0, 0.6], ["#BAE6FD", "#E2E8F0"]),
    };
  });

  const dividerStyle = useAnimatedStyle(() => {
    if (!activeToday) return { backgroundColor: "#E2E8F0" };
    const dist = Math.abs(progress.value - index);
    return {
      backgroundColor: interpolateColor(dist, [0, 0.6], ["#BAE6FD", "#E2E8F0"]),
    };
  });

  const inner = (
    <View
      style={{
        width: pageWidth,
        height: CARD_HEIGHT,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingRight: CARD_GAP,
      }}
    >
      <Animated.View
        style={[
          {
            width: cardWidth,
            height: CARD_HEIGHT,
            borderRadius: CARD_RADIUS,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            gap: 12,
            borderWidth: 1,
          },
          cardShellStyle,
        ]}
      >
        <CardDateBlock month={month} day={day} dayName={dayName} />

        <Animated.View
          style={[
            { width: 1, alignSelf: "stretch", marginVertical: 10 },
            dividerStyle,
          ]}
        />

        {/* ✅ No label — just title + weekday */}
        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ color: "#0F172A", fontSize: 14, fontWeight: "600" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ color: "#94A3B8", fontSize: 12 }} numberOfLines={1}>
            {formatWeekday(item.start_date)}
          </Text>
        </View>

        <TypeBadge isHoliday={isHoliday} />
      </Animated.View>
    </View>
  );

  if (!onCardPress) return inner;

  return (
    <Pressable
      onPress={() => onCardPress(item)}
      style={({ pressed }) => ({ opacity: pressed ? 0.82 : 1 })}
    >
      {inner}
    </Pressable>
  );
}
// ─── Main section ──────────────────────────────────────────────────────────────

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  onViewAll,
  onCardPress,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<any>(null);

  const cardWidth = screenWidth - 44;
  const pageWidth = cardWidth + CARD_GAP;

  const progress = useSharedValue(0);

  const todayKey = useMemo(() => getNepalTodayKey(), []);

  // Keep only upcoming items, today-active ones first, then by nearest date
  const visibleItems = useMemo(() => {
    const upcoming = calendarItems
      .filter((item) => isUpcoming(item, todayKey))
      .sort((a, b) => {
        const aToday = isActiveToday(a, todayKey);
        const bToday = isActiveToday(b, todayKey);
        if (aToday && !bToday) return -1;
        if (!aToday && bToday) return 1;
        // Both upcoming: sort ascending by nearest relevant date
        const aKey = a.start_date >= todayKey ? a.start_date : todayKey;
        const bKey = b.start_date >= todayKey ? b.start_date : todayKey;
        return aKey.localeCompare(bKey);
      });

    return upcoming.slice(0, MAX_VISIBLE);
  }, [calendarItems, todayKey]);

  const total = visibleItems.length;

  // Start at today-active card → nearest upcoming card → 0
  const initialIndex = useMemo(() => {
    const todayIdx = visibleItems.findIndex((item) =>
      isActiveToday(item, todayKey),
    );
    if (todayIdx !== -1) return todayIdx;
    const futureIdx = visibleItems.findIndex(
      (item) => item.start_date >= todayKey,
    );
    if (futureIdx !== -1) return futureIdx;
    return 0;
  }, [visibleItems, todayKey]);

  // Sync progress + carousel position when the list changes
  useEffect(() => {
    if (!total) {
      progress.value = 0;
      return;
    }
    progress.value = initialIndex;
    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo?.({ index: initialIndex, animated: false });
    });
  }, [initialIndex, total]);

  const renderItem = ({
    item,
    index,
  }: {
    item: CalendarItem;
    index: number;
  }) => (
    <AnimatedCard
      key={item.id}
      item={item}
      index={index}
      cardWidth={cardWidth}
      pageWidth={pageWidth}
      progress={progress}
      todayKey={todayKey}
      onCardPress={onCardPress}
    />
  );

  return (
    <View style={{ marginTop: 20 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Text style={tw`font-semibold ${TW.textPrimary} text-lg`}>
          Holidays &amp; Events
        </Text>
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 4,
            paddingHorizontal: 10,
          })}
        >
          <Text style={{ color: "#475569", fontSize: 12, fontWeight: "600" }}>
            View All
          </Text>
        </Pressable>
      </View>

      {/* Body */}
      {calendarLoading ? (
        <SkeletonCard cardWidth={cardWidth} />
      ) : total === 0 ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 32,
            borderRadius: CARD_RADIUS,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            backgroundColor: "#FFFFFF",
            gap: 6,
          }}
        >
          <Text style={{ color: "#CBD5E1", fontWeight: "600", fontSize: 14 }}>
            No upcoming events
          </Text>
          <Text style={{ color: "#E2E8F0", fontSize: 12 }}>
            No holidays or events scheduled
          </Text>
        </View>
      ) : (
        <>
          <Carousel
            ref={carouselRef}
            loop={false}
            width={pageWidth}
            height={CARD_HEIGHT}
            data={visibleItems}
            defaultIndex={initialIndex}
            pagingEnabled
            snapEnabled
            overscrollEnabled={false}
            autoPlay={false}
            enabled={total > 1}
            scrollAnimationDuration={350}
            style={{ width: cardWidth }}
            onProgressChange={(_, absoluteProgress) => {
              progress.value = absoluteProgress; // drives every card + every dot
            }}
            renderItem={renderItem}
          />

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
              {visibleItems.map((_, i) => (
                <PaginationDot
                  key={visibleItems[i].id}
                  index={i}
                  progress={progress}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};
