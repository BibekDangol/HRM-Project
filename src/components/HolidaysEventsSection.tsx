import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
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

const CARD_RADIUS = 20;
const MAX_VISIBLE = 5;
const CARD_HEIGHT = 96;

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  onViewAll,
  onCardPress,
}: Props) => {
  const { width: screenWidth } = useWindowDimensions();
  const itemWidth = screenWidth - 44;

  const visibleItems = calendarItems.slice(0, MAX_VISIBLE);
  const total = visibleItems.length;

  const [currentIndex, setCurrentIndex] = useState(0);

  const formatMonthDay = (d: string) => {
    const date = new Date(d + "T00:00:00");
    const month = date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase();
    const day = date.getDate().toString().padStart(2, "0");
    return { month, day };
  };

  const formatWeekday = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
    });

  const renderCard = ({ item }: { item: CalendarItem; index: number }) => {
    const date = formatMonthDay(item.start_date);

    const card = (
      <View
        style={{
          width: itemWidth,
          height: CARD_HEIGHT,
          borderRadius: CARD_RADIUS,
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: "#EAECEF",
          shadowColor: "#ffffff",
          shadowOpacity: 0.05,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 16,
            backgroundColor: "#F8FAFC",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            borderWidth: 1,
            borderColor: "#E2E8F0",
          }}
        >
          <Text
            style={{
              color: "#64748B",
              fontSize: 12,
              fontWeight: "700",
              letterSpacing: 0.6,
            }}
          >
            {date.month}
          </Text>
          <Text
            style={{
              color: "#0F172A",
              fontSize: 24,
              fontWeight: "800",
              lineHeight: 28,
            }}
          >
            {date.day}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#0F172A",
              fontSize: 16,
              fontWeight: "700",
            }}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text
            style={{
              color: "#64748B",
              fontSize: 13,
              marginTop: 4,
            }}
            numberOfLines={1}
          >
            {formatWeekday(item.start_date)}
          </Text>

          <View
            style={{ marginTop: 8, flexDirection: "row", alignItems: "center" }}
          >
            <View
              style={{
                backgroundColor: "#F8FAFC",
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "#E2E8F0",
              }}
            >
              <Text
                style={{
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {item.type === "holiday" ? "Holiday" : "Event"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );

    if (onCardPress) {
      return <Pressable onPress={() => onCardPress(item)}>{card}</Pressable>;
    }

    return card;
  };

  return (
    <View style={tw`mt-5 px-2`}>
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <Text style={tw`text-lg font-bold text-[#0F172A]`}>
          Holidays &amp; Events
        </Text>

        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            opacity: pressed ? 0.6 : 1,
            paddingVertical: 4,
          })}
        >
          <Text
            style={{
              color: "#475569",
              fontSize: 13,
              fontWeight: "600",
              marginRight: 2,
            }}
          >
            View All
          </Text>
        </Pressable>
      </View>

      {calendarLoading ? (
        <View
          style={[
            tw`bg-white items-center py-8`,
            {
              borderRadius: CARD_RADIUS,
              borderWidth: 1,
              borderColor: "#EAECEF",
            },
          ]}
        >
          <Text style={tw`text-gray-400 text-sm`}>Loading…</Text>
        </View>
      ) : total === 0 ? (
        <View
          style={[
            tw`bg-white items-center py-8`,
            {
              borderRadius: CARD_RADIUS,
              borderWidth: 1,
              borderColor: "#EAECEF",
            },
          ]}
        >
          <Text style={tw`text-gray-600 text-sm`}>No holidays or events</Text>
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
              }}
            >
              {visibleItems.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === currentIndex ? 16 : 6,
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: i === currentIndex ? "#64748B" : "#DCE3EA",
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
