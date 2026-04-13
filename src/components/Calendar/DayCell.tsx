import { TODAY } from "@/src/constants/adminCalendar";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { TW } from "@/theme/twStyles";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

interface Props {
  date?: { dateString: string; day: number };
  state?: string;
  marking?: {
    color?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
    selected?: boolean;
    highlighted?: boolean;
  };
  onPress: (dateString: string) => void;
}

interface DayFlags {
  isSelected: boolean;
  isWeekend: boolean;
  isDisabled: boolean;
  isPast: boolean;
  isRange: boolean;
  isToday: boolean;
  hasEvent: boolean;
  isHoliday: boolean;
  isHighlighted: boolean;
}

const CELL_WIDTH = 44;
const PILL_SIZE = 36;
const PILL_RADIUS = 12;

function getPriority(flags: DayFlags) {
  if (flags.isSelected) return "selected";
  if (flags.isRange) return "range";
  if (flags.isWeekend) return "weekend";
  if (flags.isToday) return "today";
  if (flags.isHighlighted) return "highlighted";
  if (flags.hasEvent) return "event";
  if (flags.isHoliday) return "holiday";
  if (flags.isPast) return "past";
  if (flags.isDisabled) return "disabled";
  return "default";
}

function getTextColor(
  flags: DayFlags,
  colors: { weekend: string; publicHoliday: string },
) {
  const priority = getPriority(flags);

  switch (priority) {
    case "selected":
    case "range":
    case "weekend":
      return "#FFFFFF";

    case "today":
      return TW.bgYellow;

    case "highlighted":
      return "#1B4A5A";

    case "event":
      return "#1B4A5A";

    case "holiday":
      return colors.publicHoliday;

    case "past":
      return "#94A3B8";

    case "disabled":
      return "#CBD5E1";

    default:
      return "#0F172A";
  }
}

function getBgColor(
  flags: DayFlags,
  colors: { weekend: string; publicHoliday: string },
  rangeColor: string,
) {
  const priority = getPriority(flags);

  switch (priority) {
    case "selected":
      return TW.bgYellow;

    case "range":
      return rangeColor;

    case "weekend":
      return colors.weekend;

    default:
      return "transparent";
  }
}

function getBorderStyle(
  flags: DayFlags,
  colors: { weekend: string; publicHoliday: string },
  eventColor?: string,
) {
  if (flags.isSelected) {
    return {
      borderWidth: 2,
      borderRadius: PILL_RADIUS,
      borderColor: TW.bgYellow,
    };
  }

  if (flags.isToday) {
    return {
      borderWidth: 2,
      borderRadius: PILL_RADIUS,
      borderColor: TW.bgYellow,
    };
  }

  if (flags.isHighlighted) {
    return {
      borderWidth: 1.5,
      borderRadius: PILL_RADIUS,
      borderColor: "#1B4A5A",
    };
  }

  if (flags.hasEvent) {
    return {
      borderWidth: 1.5,
      borderRadius: PILL_RADIUS,
      borderColor: eventColor || "#1B4A5A",
    };
  }

  if (flags.isHoliday) {
    return {
      borderWidth: 1.5,
      borderRadius: PILL_RADIUS,
      borderColor: colors.publicHoliday,
    };
  }

  return {};
}

function getFontWeight(
  flags: DayFlags,
  type: string,
): "700" | "600" | "500" | "400" {
  if (flags.isSelected || flags.isRange || flags.isWeekend) return "700";
  if (flags.isToday || flags.isHighlighted || flags.hasEvent || flags.isHoliday)
    return "600";
  if (flags.isDisabled || flags.isPast) return "400";
  if (type !== "officeDay") return "600";
  return "500";
}

export function DayCell({ date, state, marking, onPress }: Props) {
  const store = useCalendarStore();

  if (!date) return <View style={{ width: CELL_WIDTH, height: 52 }} />;

  const { dateString, day } = date;
  const type = calendarStore.getDayType(dateString);
  const cfg = store.days[dateString];
  const events = cfg?.events ?? [];

  const isRange = !!marking?.color && marking.color !== "transparent";
  const isRangeStart = isRange && !!marking?.startingDay;
  const isRangeEnd = isRange && !!marking?.endingDay;
  const isRangeMid = isRange && !isRangeStart && !isRangeEnd;
  const rangeColor = marking?.color ?? store.colors.publicHoliday;

  const flags: DayFlags = {
    isSelected: marking?.selected === true,
    isWeekend: type === "weekend",
    isDisabled: state === "disabled",
    isPast: dateString < TODAY,
    isRange,
    isToday: dateString === TODAY,
    hasEvent: events.length > 0,
    isHoliday: type === "publicHoliday",
    isHighlighted: marking?.highlighted === true,
  };

  const dots = [
    ...(cfg?.holidayLabel
      ? [{ id: "holiday", color: store.colors.publicHoliday }]
      : []),
    ...events.map((ev) => ({ id: ev.id, color: ev.color || "#1B4A5A" })),
  ].slice(0, 4);

  const showDots =
    dots.length > 0 &&
    !flags.isDisabled &&
    !flags.isPast &&
    !flags.isSelected &&
    !flags.isRange &&
    !flags.isWeekend;

  const textColor = getTextColor(flags, store.colors);
  const bgColor = getBgColor(flags, store.colors, rangeColor);
  const borderStyle = getBorderStyle(flags, store.colors, events[0]?.color);
  const fontWeight = getFontWeight(flags, type);

  return (
    <Pressable
      disabled={flags.isDisabled}
      onPress={() => onPress(dateString)}
      hitSlop={6}
      style={({ pressed }) => [
        tw`items-center`,
        { width: CELL_WIDTH, height: 52 },
        pressed && !flags.isDisabled && { opacity: 0.7 },
      ]}
    >
      {/* Range connector */}
      {isRange && (
        <>
          {isRangeMid && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: -6,
                right: -6,
                height: 28,
                backgroundColor: rangeColor,
                zIndex: 0,
              }}
            />
          )}

          {isRangeStart && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: CELL_WIDTH / 2,
                right: -6,
                height: 28,
                backgroundColor: rangeColor,
                zIndex: 0,
              }}
            />
          )}

          {isRangeEnd && (
            <View
              style={{
                position: "absolute",
                top: 8,
                left: -6,
                right: CELL_WIDTH / 2,
                height: 28,
                backgroundColor: rangeColor,
                zIndex: 0,
              }}
            />
          )}
        </>
      )}

      {/* Day pill */}
      <View style={{ paddingTop: 4, zIndex: 2 }}>
        <View
          style={[
            tw`items-center justify-center`,
            {
              width: PILL_SIZE,
              height: PILL_SIZE,
              borderRadius: PILL_RADIUS,
              backgroundColor: bgColor === "transparent" ? undefined : bgColor,
            },
            borderStyle,
            flags.isHighlighted &&
              !flags.isSelected && {
                shadowColor: "#1B4A5A",
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              },
          ]}
        >
          <Text style={[tw`text-sm`, { fontWeight, color: textColor }]}>
            {day}
          </Text>
        </View>

        {showDots && (
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