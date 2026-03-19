import { TODAY } from "@/src/constants/adminCalendar";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface Props {
  date?: {
    dateString: string;
    day: number;
  };
  state?: string;
  marking?: {
    color?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
  };
  onPress: (dateString: string) => void;
}

export function DayCell({ date, state, marking, onPress }: Props) {
  const store = useCalendarStore();

  if (!date) return <View style={tw`w-9 h-11`} />;

  const { dateString, day } = date;
  const type = calendarStore.getDayType(dateString);

  const dayColor =
    type === "publicHoliday"
      ? store.colors.publicHoliday
      : type === "weekend"
        ? store.colors.weekend
        : store.colors.officeDay;

  const cfg = store.days[dateString];
  const hasHoliday = !!cfg?.holidayLabel;
  const events = cfg?.events ?? [];
  const hasEvent = events.length > 0;
  const eventFillColor = events[0]?.color;

  const isToday = dateString === TODAY;
  const isDisabled = state === "disabled";

  // ── Range selection state ──────────────────────────
  const isRangeSelected = !!marking?.color && marking.color !== "transparent";
  const isRangeStart = isRangeSelected && marking?.startingDay;
  const isRangeEnd = isRangeSelected && marking?.endingDay;
  const isRangeMid = isRangeSelected && !isRangeStart && !isRangeEnd;
  const rangeColor = marking?.color ?? store.colors.publicHoliday;
  // ────────────────────────────────────────────────────

  const dots = [
    ...(hasHoliday
      ? [{ id: "holiday", color: store.colors.publicHoliday }]
      : []),
    ...events.map((ev) => ({ id: ev.id, color: ev.color })),
  ].slice(0, 4);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={() => onPress(dateString)}
      hitSlop={6}
      style={({ pressed }) => [
        tw`items-center w-9`,
        pressed && !isDisabled && tw`opacity-70`,
      ]}
    >
      {/* ── Range mid background strip ── */}
      {isRangeMid && (
        <View
          style={[
            tw`absolute top-1 left-0 right-0 h-8`,
            { backgroundColor: rangeColor + "100" }, // ← semi-transparent strip
          ]}
        />
      )}

      {/* ── Range start / end half strip ── */}
      {(isRangeStart || isRangeEnd) && (
        <View
          style={[
            tw`absolute top-1 h-8`,
            {
              left: isRangeStart ? "50%" : 0,
              right: isRangeEnd ? "50%" : 0,
              backgroundColor: rangeColor + "100", // ← same semi-transparent
            },
          ]}
        />
      )}

      <View style={tw`py-1`}>
        <View
          style={[
            tw`w-8 h-8 rounded-lg items-center justify-center`,

            // Today (border only if not selected)
            isToday &&
              !isRangeSelected && {
                borderWidth: 2,
                borderColor: "#FFB300",
                // backgroundColor: "transparent",
              },

            // Range fill
            isRangeSelected && {
              backgroundColor: rangeColor,
            },

            // Event fill (if not range & not today)
            !isRangeSelected &&
              !isToday &&
              hasEvent && {
                backgroundColor: eventFillColor,
              },

            // Holiday / weekend fill (if no event)
            !isRangeSelected &&
              !isToday &&
              !hasEvent &&
              type !== "officeDay" && {
                backgroundColor: dayColor + "30",
              },
          ]}
        >
          <Text
            style={[
              tw`text-sm`,
              {
                fontWeight: type !== "officeDay" ? "700" : "500",
                color: isDisabled
                  ? "#7a7a7a"
                  : isRangeSelected || hasEvent
                    ? "white"
                    : isToday
                      ? "#F59E0B"
                      : type !== "officeDay"
                        ? dayColor
                        : "#ffffff",
              },
            ]}
          >
            {day}
          </Text>
        </View>

        {dots.length > 0 && !isDisabled && (
          <View style={tw`flex-row gap-0.5 mt-0.5 justify-center`}>
            {dots.map((dot) => (
              <View
                key={dot.id}
                style={[
                  tw`w-1 h-1 rounded-full`,
                  { backgroundColor: dot.color },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </Pressable>
  );
}
