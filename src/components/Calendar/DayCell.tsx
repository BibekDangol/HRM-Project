import { TODAY } from "@/src/constants/adminCalendar";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";
import { TW } from "@/theme/twStyles";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  date?: { dateString: string; day: number };
  state?: string;
  marking?: {
    color?: string;
    textColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
    selected?: boolean;
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TINT = 0.19;
const RANGE_TINT = 0.12;
const BORDER = { borderWidth: 2, borderRadius: 8 };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const withOpacity = (hex: string, opacity: number) =>
  hex +
  Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");

function getTextColor(
  flags: DayFlags,
  colors: { weekend: string; publicHoliday: string },
): string {
  if (flags.isSelected) return "#FFF";
  if (flags.isWeekend) return colors.weekend;
  if (flags.isDisabled) return "#CBD5E1";
  if (flags.isPast) return "#94A3B8";
  if (flags.isRange) return "#FFF";
  if (flags.isToday) return TW.bgYellow;
  if (flags.hasEvent) return "#FFF";
  if (flags.isHoliday) return colors.publicHoliday;
  return "#0F172A";
}

function getBgColor(
  flags: DayFlags,
  colors: { weekend: string; publicHoliday: string },
  rangeColor: string,
  eventColor?: string,
): string {
  if (flags.isSelected) return TW.bgYellow;
  if (flags.isWeekend) return withOpacity(colors.weekend, TINT);
  if (flags.isDisabled || flags.isPast) return "transparent";
  if (flags.isRange) return rangeColor;
  if (flags.hasEvent && eventColor) return eventColor;
  if (flags.isHoliday) return withOpacity(colors.publicHoliday, TINT);
  return "transparent";
}

function getBorderStyle(flags: DayFlags) {
  if (flags.isSelected && !flags.isWeekend)
    return { ...BORDER, borderColor: TW.bgYellow };
  if (flags.isToday && !flags.isSelected && !flags.isWeekend)
    return { ...BORDER, borderColor: TW.bgYellow };
  return {};
}

function getFontWeight(
  flags: DayFlags,
  type: string,
): "700" | "600" | "500" | "400" {
  if (flags.isSelected || flags.isWeekend || flags.isRange || flags.hasEvent)
    return "700";
  if (flags.isDisabled || flags.isPast) return "400";
  if (type !== "officeDay") return "600";
  return "500";
}

export function DayCell({ date, state, marking, onPress }: Props) {
  const store = useCalendarStore();

  if (!date) return <View style={tw`w-9 h-11`} />;

  const { dateString, day } = date;
  const type = calendarStore.getDayType(dateString);
  const cfg = store.days[dateString];
  const events = cfg?.events ?? [];

  // ── Range ───────────────────────────────────────────────────────────────────
  const isRange = !!marking?.color && marking.color !== "transparent";
  const isRangeStart = isRange && marking?.startingDay;
  const isRangeEnd = isRange && marking?.endingDay;
  const isRangeMid = isRange && !isRangeStart && !isRangeEnd;
  const rangeColor = marking?.color ?? store.colors.publicHoliday;

  // ── Flags object ────────────────────────────────────────────────────────────
  const flags: DayFlags = {
    isSelected: marking?.selected === true,
    isWeekend: type === "weekend",
    isDisabled: state === "disabled",
    isPast: dateString < TODAY,
    isRange,
    isToday: dateString === TODAY,
    hasEvent: events.length > 0,
    isHoliday: type === "publicHoliday",
  };

  // ── Dots ────────────────────────────────────────────────────────────────────
  const dots = [
    ...(cfg?.holidayLabel
      ? [{ id: "holiday", color: store.colors.publicHoliday }]
      : []),
    ...events.map((ev) => ({ id: ev.id, color: ev.color })),
  ].slice(0, 4);

  const showDots =
    dots.length > 0 && !flags.isDisabled && !flags.isPast && !flags.isWeekend;

  // ── Styles ──────────────────────────────────────────────────────────────────
  const textColor = getTextColor(flags, store.colors);
  const bgColor = getBgColor(flags, store.colors, rangeColor, events[0]?.color);
  const borderStyle = getBorderStyle(flags);
  const fontWeight = getFontWeight(flags, type);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Pressable
      disabled={flags.isDisabled}
      onPress={() => onPress(dateString)}
      hitSlop={6}
      style={({ pressed }) => [
        tw`items-center w-9`,
        pressed && !flags.isDisabled && tw`opacity-70`,
      ]}
    >
      {/* Range mid strip */}
      {isRangeMid && (
        <View
          style={[
            tw`absolute top-1 left-0 right-0 h-8`,
            { backgroundColor: withOpacity(rangeColor, RANGE_TINT) },
          ]}
        />
      )}

      {/* Range start/end half-strip */}
      {(isRangeStart || isRangeEnd) && (
        <View
          style={[
            tw`absolute top-1 h-8`,
            {
              left: isRangeStart ? "50%" : 0,
              right: isRangeEnd ? "50%" : 0,
              backgroundColor: withOpacity(rangeColor, RANGE_TINT),
            },
          ]}
        />
      )}

      <View style={tw`py-1`}>
        {/* Day circle */}
        <View
          style={[
            tw`w-8 h-8 rounded-lg items-center justify-center`,
            borderStyle,
            bgColor !== "transparent" && { backgroundColor: bgColor },
          ]}
        >
          <Text style={[tw`text-sm`, { fontWeight, color: textColor }]}>
            {day}
          </Text>
        </View>

        {/* Dots */}
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
