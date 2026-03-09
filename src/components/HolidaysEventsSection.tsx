import React from "react";
import { View, Text } from "react-native";
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
};

export const HolidaysEventsSection = ({
  calendarItems,
  calendarLoading,
  monthTitle,
  selectedYear,
}: Props) => {
  const formatDate = (d: string) => {
    const [, , day] = d.split("-");
    const date = new Date(d + "T00:00:00");

    return `${parseInt(day)} ${date.toLocaleDateString("en-US", {
      month: "short",
    })}`;
  };

  return (
    <View style={tw`mt-5`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text
          style={tw`text-xs font-bold text-gray-400 uppercase tracking-widest`}
        >
          Holidays & Events
        </Text>

        <Text style={tw`text-xs text-gray-400 font-medium`}>
          {monthTitle} {selectedYear}
        </Text>
      </View>

      {/* Loading */}
      {calendarLoading ? (
        <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
          <Text style={tw`text-gray-400 text-sm`}>Loading…</Text>
        </View>
      ) : calendarItems.length === 0 ? (
        /* Empty State */
        <View style={tw`bg-gray-50 rounded-2xl px-4 py-8 items-center`}>
          <Text style={tw`text-2xl mb-2`}>📅</Text>

          <Text style={tw`text-gray-600 font-semibold text-sm`}>
            No holidays or events
          </Text>

          <Text style={tw`text-gray-400 text-xs mt-1`}>
            Nothing scheduled for {monthTitle}
          </Text>
        </View>
      ) : (
        /* List */
        <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
          {calendarItems.map((item, i) => {
            const isHoliday = item.type === "holiday";

            const dateLabel =
              !item.end_date || item.start_date === item.end_date
                ? formatDate(item.start_date)
                : `${formatDate(item.start_date)} – ${formatDate(
                    item.end_date,
                  )}`;

            return (
              <View
                key={item.id}
                style={[
                  tw`flex-row items-center px-4 py-3.5`,
                  i < calendarItems.length - 1 && tw`border-b border-slate-50`,
                ]}
              >
                {/* Color Indicator */}
                <View
                  style={[
                    tw`w-1 self-stretch rounded-full mr-3`,
                    { backgroundColor: item.color },
                  ]}
                />

                {/* Title + Date */}
                <View style={tw`flex-1`}>
                  <Text
                    style={tw`text-sm font-bold text-gray-800`}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text style={tw`text-xs text-gray-400 mt-0.5`}>
                    {dateLabel}
                  </Text>
                </View>

                {/* Tag */}
                <View
                  style={[
                    tw`px-2.5 py-1 rounded-full`,
                    { backgroundColor: item.color + "18" },
                  ]}
                >
                  <Text style={[tw`text-xs font-bold`, { color: item.color }]}>
                    {isHoliday ? "Holiday" : "Event"}
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
