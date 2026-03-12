import { Text, View } from "react-native";

import { TW } from "@/theme/twStyles";
import React from "react";
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
    <View style={tw`p-2`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between`}>
        <Text style={tw`font-semibold ${TW.textPrimary} text-lg`}>
          Holidays & Events
        </Text>
        <Text style={tw`${TW.textSecondary} text-xs`}>
          {monthTitle} {selectedYear}
        </Text>
      </View>

      {/* ── Loading ── */}
      {calendarLoading ? (
        <View style={tw`${TW.bgButton} rounded-2xl px-4 py-8 items-center`}>
          <Text style={tw`${TW.textSecondary} text-sm`}>Loading…</Text>
        </View>
      ) : calendarItems.length === 0 ? (
        /* Empty State */
        <View style={tw`${TW.bgButton} rounded-2xl px-4 py-8 items-center`}>
          <Text style={tw`${TW.textPrimary} text-sm`}>
            No holidays or events
          </Text>

          <Text style={tw`${TW.textSecondary} text-xs mt-1`}>
            Nothing scheduled for {monthTitle}
          </Text>
        </View>
      ) : (
        /* List */
        <View style={tw`${TW.bgButton} rounded-2xl overflow-hidden`}>
          {calendarItems.map((item, i) => {
            const isHoliday = item.type === "holiday";

            const dateLabel =
              !item.end_date || item.start_date === item.end_date
                ? formatDate(item.start_date)
                : `${formatDate(item.start_date)} – ${formatDate(
                  item.end_date
                )}`;

            return (
              <View
                key={item.id}
                style={[
                  tw`flex-row items-center px-3 py-3.5`,
                  i < calendarItems.length - 1 && tw`border-b ${TW.BORDER}`,
                ]}
              >
                {/* Title + Date */}
                <View style={tw`flex-1`}>
                  <Text
                    style={tw`${TW.textPrimary} text-sm`}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text style={tw`${TW.textSecondary} text-xs mt-0.5`}>
                    {dateLabel}
                  </Text>
                </View>

                {/* Tag */}
                <View>
                  <Text
                    style={[
                      tw`text-xs font-semibold`,
                      isHoliday
                        ? tw`${TW.textTertiary}`
                        : tw`${TW.textSecondary}`,
                    ]}
                  >
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