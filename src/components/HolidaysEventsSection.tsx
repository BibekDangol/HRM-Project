import { fontSizes, lineHeights, typography } from "@/theme/typography";
import { colors } from "@/theme/colors";
import React, { useEffect, useMemo, useRef } from "react";
import { Pressable, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  runOnUI,
} from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import tw from "@/theme/tw";

import { TW } from "@/theme/twStyles";
import {
  formatMonthDay,
  formatWeekday,
  getNepalTodayKey,
} from "@/src/utils/calendar.utils";
import { CalendarItem } from "../types/Calendar";

type Props = {
  calendarItems: CalendarItem[];
  calendarLoading: boolean;
  onViewAll: () => void;
  onCardPress?: (item: CalendarItem) => void;
  style?: StyleProp<ViewStyle>;
};

const CARD_RADIUS = 12;
const MAX_VISIBLE = 5;
const CARD_HEIGHT = 120;
const CARD_GAP = 12;

function isActiveToday(item: CalendarItem, todayKey: string) {
  const endDate = item.end_date || item.start_date;
  return item.start_date <= todayKey && endDate >= todayKey;
}

function isUpcoming(item: CalendarItem, todayKey: string) {
  return item.start_date > todayKey;
}

function isPast(item: CalendarItem, todayKey: string) {
  const endDate = item.end_date || item.start_date;
  return endDate < todayKey;
}

function getSortPriority(item: CalendarItem, todayKey: string) {
  if (isActiveToday(item, todayKey)) return 0;
  if (isUpcoming(item, todayKey)) return 1;
  return 2;
}

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
        [colors.primary, colors.border]
      ),
    };
  });

  return (
    <Animated.View style={[{ height: 6, borderRadius: 999 }, animatedStyle]} />
  );
}

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
        width: 52,
        backgroundColor: colors.canvas,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 4,
      }}
    >
      <Text
        style={{
          color: colors.subtle,
          fontSize: fontSizes.label, lineHeight: lineHeights.label,
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
          fontSize: fontSizes.section,
          fontWeight: "700",
          lineHeight: lineHeights.section,
        }}
      >
        {day}
      </Text>

      <Text style={{ color: colors.subtle, fontSize: fontSizes.label, lineHeight: lineHeights.label, fontWeight: "500" }}>
        {dayName}
      </Text>
    </View>
  );
}

function TypeBadge({ isHoliday }: { isHoliday: boolean }) {
  const badgeBg = isHoliday ? colors.dangerSoft : colors.primarySoft;
  const badgeText = isHoliday ? colors.dangerText : colors.primary;
  const badgeDot = isHoliday ? colors.danger : colors.primary;

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
        alignSelf: "flex-start",
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

      <Text style={{ fontSize: fontSizes.caption, lineHeight: lineHeights.caption, fontWeight: "600", color: badgeText }}>
        {isHoliday ? "Holiday" : "Event"}
      </Text>
    </View>
  );
}

function SkeletonCard({ cardWidth }: { cardWidth: number }) {
  return (
    <View
      style={{
        width: cardWidth,
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: colors.canvas,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View
        style={{
          alignItems: "center",
          width: 52,
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
          width: 1,
          alignSelf: "stretch",
          backgroundColor: colors.border,
          marginVertical: 10,
        }}
      />

      <View style={{ flex: 1, gap: 6 }}>
        <View
          style={{
            width: "65%",
            height: 12,
            borderRadius: 4,
            backgroundColor: colors.border,
          }}
        />
        <View
          style={{
            width: "40%",
            height: 9,
            borderRadius: 4,
            backgroundColor: colors.surfaceMuted,
          }}
        />
      </View>

      <View
        style={{
          width: 60,
          height: 24,
          borderRadius: 999,
          backgroundColor: colors.border,
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
  isHighlighted,
  onCardPress,
}: {
  item: CalendarItem;
  index: number;
  cardWidth: number;
  pageWidth: number;
  progress: SharedValue<number>;
  todayKey: string;
  isHighlighted: boolean;
  onCardPress?: (item: CalendarItem) => void;
}) {
  const { month, day, dayName } = formatMonthDay(item.start_date);
  const isHoliday = item.type === "holiday";

  const cardShellStyle = useAnimatedStyle(() => {
    const dist = Math.abs(progress.value - index);

    if (isHighlighted) {
      return {
        backgroundColor: interpolateColor(dist, [0, 0.6], [colors.primarySoft, colors.surface]),
        borderColor: interpolateColor(dist, [0, 0.6], [colors.primaryBorder, colors.border]),
      };
    }

    return {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    };
  });

  const dividerStyle = useAnimatedStyle(() => {
    const dist = Math.abs(progress.value - index);

    if (isHighlighted) {
      return {
        backgroundColor: interpolateColor(dist, [0, 0.6], [colors.primaryBorder, colors.border]),
      };
    }

    return {
      backgroundColor: colors.border,
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

        <View style={{ flex: 1, gap: 4 }}>
          <Text
            style={{ color: colors.ink, fontSize: fontSizes.label, lineHeight: lineHeights.label, fontWeight: "600" }}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={{ color: colors.subtle, fontSize: fontSizes.label, lineHeight: lineHeights.label }} numberOfLines={1}>
            {formatWeekday(item.start_date)}
          </Text>
          <TypeBadge isHoliday={isHoliday} />
        </View>
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

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  onViewAll,
  onCardPress,
  style,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const carouselRef = useRef<any>(null);

  const cardWidth = screenWidth - 44;
  const pageWidth = cardWidth + CARD_GAP;
  const progress = useSharedValue(0);

  const todayKey = useMemo(() => getNepalTodayKey(), []);

  const visibleItems = useMemo(() => {
    return [...calendarItems]
      .filter((item) => !isPast(item, todayKey))
      .sort((a, b) => {
        const priorityDiff =
          getSortPriority(a, todayKey) - getSortPriority(b, todayKey);

        if (priorityDiff !== 0) return priorityDiff;

        return a.start_date.localeCompare(b.start_date);
      })
      .slice(0, MAX_VISIBLE);
  }, [calendarItems, todayKey]);

  const total = visibleItems.length;

  const highlightedIndex = useMemo(() => {
    const todayIdx = visibleItems.findIndex((item) =>
      isActiveToday(item, todayKey)
    );
    if (todayIdx !== -1) return todayIdx;

    const futureIdx = visibleItems.findIndex((item) => item.start_date >= todayKey);
    if (futureIdx !== -1) return futureIdx;

    return 0;
  }, [visibleItems, todayKey]);

  useEffect(() => {
    const targetIndex = total ? highlightedIndex : 0;
    runOnUI((val: number) => {
      "worklet";
      progress.value = val;
    })(targetIndex);

    requestAnimationFrame(() => {
      carouselRef.current?.scrollTo?.({ index: targetIndex, animated: false });
    });
  }, [highlightedIndex, total, progress]);

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
      isHighlighted={index === highlightedIndex}
      onCardPress={onCardPress}
    />
  );

  return (
    <View style={[{ marginTop: 20, gap: 12 }, style]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text accessibilityRole="header" style={tw`font-semibold ${TW.textPrimary} text-section`}>
          Holidays &amp; Events
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="View all holidays and events"
          onPress={onViewAll}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 12,
            minHeight: 48,
            justifyContent: "center",
            paddingHorizontal: 10,
          })}
        >
          <Text style={typography.link}>
            View All
          </Text>
        </Pressable>
      </View>

      {calendarLoading ? (
        <SkeletonCard cardWidth={cardWidth} />
      ) : total === 0 ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 32,
            borderRadius: CARD_RADIUS,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            gap: 6,
          }}
        >
          <Text style={typography.cardTitle}>
            No upcoming events
          </Text>
          <Text style={{ color: colors.muted, fontSize: fontSizes.label, lineHeight: lineHeights.label }}>
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
            defaultIndex={highlightedIndex}
            pagingEnabled
            snapEnabled
            overscrollEnabled={false}
            autoPlay={false}
            enabled={total > 1}
            scrollAnimationDuration={350}
            style={{ width: cardWidth }}
            onProgressChange={(_, absoluteProgress) => {
              runOnUI((val: number) => {
                "worklet";
                progress.value = val;
              })(absoluteProgress);
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