import React, { useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { TW } from "@/theme/twStyles";
import Carousel from "react-native-reanimated-carousel";
import tw from "twrnc";

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
const CARD_HEIGHT = 80;

const parseLocalDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  onViewAll,
  onCardPress,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth - 44;
  const [currentIndex, setCurrentIndex] = useState(0);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const upcomingItems = useMemo(() => {
    return calendarItems
      .filter((item) => {
        const start = parseLocalDate(item.start_date);
        const end = item.end_date ? parseLocalDate(item.end_date) : start;
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return end >= today;
      })
      .sort((a, b) => {
        return (
          parseLocalDate(a.start_date).getTime() -
          parseLocalDate(b.start_date).getTime()
        );
      });
  }, [calendarItems, today]);
  const visibleItems = upcomingItems.slice(0, MAX_VISIBLE);
  const total = visibleItems.length;

  const highlightedItemId = visibleItems.length > 0 ? visibleItems[0].id : null;

  const formatMonthDay = (d: string) => {
    const date = parseLocalDate(d);
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const day = date.getDate().toString().padStart(2, "0");
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    return { month, day, dayName };
  };

  const formatWeekday = (d: string) =>
    parseLocalDate(d).toLocaleDateString("en-US", {
      weekday: "long",
    });

  const renderCard = ({ item }: { item: CalendarItem; index: number }) => {
    const { month, day, dayName } = formatMonthDay(item.start_date);

    const isHighlighted = item.id === highlightedItemId;
    const isHoliday = item.type === "holiday";

    const badgeBg = isHoliday ? "#FEE2E2" : "#EEF2FF";
    const badgeText = isHoliday ? "#B91C1C" : "#4338CA";
    const badgeDot = isHoliday ? "#EF4444" : "#6366F1";

    const card = (
      <View
        style={{
          width: itemWidth,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          backgroundColor: isHighlighted ? "#F0F9FF" : "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 12,
          gap: 12,
          borderWidth: 0.5,
          borderColor: isHighlighted ? "#BAE6FD" : "#E2E8F0",
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}>
        <View
          style={{
            alignItems: "center",
            width: 44,
            backgroundColor: isHighlighted ? "#FFFFFF" : "#F8FAFC",
            borderRadius: 8,
            paddingVertical: 6,
            paddingHorizontal: 4,
          }}>
          <Text
            style={{
              color: "#94A3B8",
              fontSize: 9,
              fontWeight: "600",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}>
            {month}
          </Text>

          <Text
            style={{
              color: "#0F172A",
              fontSize: 20,
              fontWeight: "700",
              lineHeight: 24,
            }}>
            {day}
          </Text>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 9,
              fontWeight: "500",
            }}>
            {dayName}
          </Text>
        </View>

        <View
          style={{
            width: 0.5,
            alignSelf: "stretch",
            backgroundColor: isHighlighted ? "#BAE6FD" : "#E2E8F0",
            marginVertical: 10,
          }}
        />

        <View style={{ flex: 1, gap: 4 }}>
          {isHighlighted && (
            <Text
              style={{
                color: "#64748B",
                fontSize: 9,
                fontWeight: "700",
                letterSpacing: 0.6,
              }}>
              UPCOMING
            </Text>
          )}

          <Text
            style={{
              color: "#0F172A",
              fontSize: 14,
              fontWeight: "600",
            }}
            numberOfLines={1}>
            {item.title}
          </Text>

          <Text
            style={{
              color: "#94A3B8",
              fontSize: 12,
            }}
            numberOfLines={1}>
            {formatWeekday(item.start_date)}
          </Text>
        </View>

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
          }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: badgeDot,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: badgeText,
            }}>
            {isHoliday ? "Holiday" : "Event"}
          </Text>
        </View>
      </View>
    );

    if (onCardPress) {
      return (
        <Pressable
          onPress={() => onCardPress(item)}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
          {card}
        </Pressable>
      );
    }

    return card;
  };

  const SkeletonCard = () => (
    <View
      style={{
        width: "100%",
        height: CARD_HEIGHT,
        borderRadius: CARD_RADIUS,
        backgroundColor: "#F8FAFC",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        gap: 12,
        borderWidth: 0.5,
        borderColor: "#E2E8F0",
      }}>
      <View
        style={{
          alignItems: "center",
          width: 44,
          backgroundColor: "#F1F5F9",
          borderRadius: 8,
          paddingVertical: 6,
          paddingHorizontal: 4,
          gap: 3,
        }}>
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
          width: 0.5,
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

  return (
    <View style={{ marginTop: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}>
        <Text style={tw`font-semibold ${TW.textPrimary} text-lg`}>
          Holidays &amp; Events
        </Text>

        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => ({
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 4,
            paddingHorizontal: 10,
          })}>
          <Text
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: "600",
            }}>
            View All
          </Text>
        </Pressable>
      </View>

      {calendarLoading ? (
        <SkeletonCard />
      ) : total === 0 ? (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 32,
            borderRadius: CARD_RADIUS,
            borderWidth: 0.5,
            borderColor: "#E2E8F0",
            backgroundColor: "#FFFFFF",
            gap: 6,
          }}>
          <Text
            style={{
              color: "#CBD5E1",
              fontWeight: "600",
              fontSize: 14,
            }}>
            No upcoming events
          </Text>

          <Text
            style={{
              color: "#E2E8F0",
              fontSize: 12,
            }}>
            No holidays or events scheduled
          </Text>
        </View>
      ) : (
        <>
          <Carousel
            loop={false}
            width={itemWidth}
            height={CARD_HEIGHT}
            data={visibleItems}
            pagingEnabled
            snapEnabled
            overscrollEnabled={false}
            autoPlay={false}
            style={{ width: itemWidth }}
            onProgressChange={(_, absoluteProgress) => {
              const index = Math.round(absoluteProgress);
              if (index !== currentIndex && index >= 0 && index < total) {
                setCurrentIndex(index);
              }
            }}
            renderItem={renderCard}
          />

          {total > 1 && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
              }}>
              {visibleItems.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === currentIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: i === currentIndex ? "#1B4A5A" : "#DCE3EA",
                  }}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
};
