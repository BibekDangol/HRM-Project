import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import { ChevronDown } from "lucide-react-native";
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ROW_HEIGHT = 54;

type Mode = "year" | "month";

type Props = {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number;
  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;
  onClose: () => void;
  onClear?: () => void;
  onConfirm?: () => void;
};

const YEARS: number[] = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MIN_YEAR + i,
);

function chunk<T>(arr: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    rows.push(arr.slice(i, i + size));
  }
  return rows;
}

const YEAR_ROWS = chunk(YEARS, 3);
const MONTH_ROWS = chunk(MONTHS, 3);

const GridCell = memo(function GridCell({
  label,
  isSelected,
  onPress,
}: {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={s.cellOuter}
    >
      <View style={[s.cellPill, isSelected && s.cellPillSelected]}>
        <Text style={[s.cellText, isSelected && s.cellTextSelected]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

export function MonthPickerModal({
  visible,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
  onClose,
  onClear,
  onConfirm,
}: Props) {
  const [mode, setMode] = useState<Mode>("year");
  const scrollRef = useRef<ScrollView>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;

  const shortMonth = useMemo(
    () => MONTHS[selectedMonth]?.slice(0, 3) ?? "",
    [selectedMonth],
  );

  useEffect(() => {
    if (!visible) {
      overlayOpacity.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(0.96);
      cardTranslateY.setValue(18);
      return;
    }

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, overlayOpacity, cardOpacity, cardScale, cardTranslateY]);

  useEffect(() => {
    if (!visible) return;

    const frame = requestAnimationFrame(() => {
      if (mode === "year") {
        const rowIndex = Math.floor((selectedYear - MIN_YEAR) / 3);
        const y = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT * 2);
        scrollRef.current?.scrollTo({ y, animated: false });
      } else {
        const rowIndex = Math.floor(selectedMonth / 3);
        const y = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT);
        scrollRef.current?.scrollTo({ y, animated: false });
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [visible, mode, selectedYear, selectedMonth]);

  const switchToYear = useCallback(() => setMode("year"), []);
  const switchToMonth = useCallback(() => setMode("month"), []);

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
      return;
    }

    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setMode("year");
  }, [onClear, setSelectedMonth, setSelectedYear]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[s.backdrop, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            s.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }, { translateY: cardTranslateY }],
            },
          ]}
        >
          <Pressable onPress={() => { }}>
            <View style={s.header}>
              <Text style={s.headerLabel}>Select date</Text>
              <Text style={s.headerDate}>
                {shortMonth}, {selectedYear}
              </Text>
            </View>

            <View style={s.divider} />

            <View style={s.toggleRow}>
              <TouchableOpacity
                onPress={switchToYear}
                style={s.toggleBtn}
                activeOpacity={0.7}
              >
                <Text style={[s.toggleText, mode === "year" && s.toggleActive]}>
                  {selectedYear}
                </Text>
                <ChevronDown
                  size={15} color={TW.bgSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={switchToMonth}
                style={s.toggleBtn}
                activeOpacity={0.7}
              >
                <Text
                  style={[s.toggleText, mode === "month" && s.toggleActive]}
                >
                  {MONTHS[selectedMonth]}
                </Text>
                {/* <Text style={s.caret}>▲</Text> */}
                <ChevronDown
                  size={15} color={TW.bgSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              ref={scrollRef}
              style={s.grid}
              contentContainerStyle={s.gridContent}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews
            >
              {mode === "year"
                ? YEAR_ROWS.map((row, ri) => (
                  <View key={ri} style={s.row}>
                    {row.map((year) => (
                      <GridCell
                        key={year}
                        label={`${year}`}
                        isSelected={year === selectedYear}
                        onPress={() => setSelectedYear(year)}
                      />
                    ))}
                  </View>
                ))
                : MONTH_ROWS.map((row, ri) => (
                  <View key={ri} style={s.row}>
                    {row.map((month, ci) => {
                      const index = ri * 3 + ci;
                      return (
                        <GridCell
                          key={month}
                          label={month.slice(0, 3)}
                          isSelected={index === selectedMonth}
                          onPress={() => setSelectedMonth(index)}
                        />
                      );
                    })}
                  </View>
                ))}
            </ScrollView>

            <View style={s.divider} />

            <View style={s.actions}>
              <TouchableOpacity
                onPress={handleClear}
                activeOpacity={0.7}
                style={s.actionClear}
              >
                <Text style={s.actionText}>Clear</Text>
              </TouchableOpacity>

              <View style={s.actionRight}>
                <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                  <Text style={s.actionText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleConfirm} activeOpacity={0.7}>
                  <Text style={s.actionText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: TW.bgPrimary,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: TW.bgSecondary,
  },
  headerLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerDate: {
    fontSize: 30,
    fontWeight: "400",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEF2F4",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 6,
  },
  toggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "700",
    color: TW.bgSecondary,
  },
  toggleActive: {
    color: TW.bgSecondary,
  },
  caret: {
    color: TW.bgSecondary,
    fontSize: 11,
  },
  grid: {
    maxHeight: 280,
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
  },
  cellOuter: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 7,
  },
  cellPill: {
    height: 40,
    minWidth: 80,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  cellPillSelected: {
    backgroundColor: TW.bgYellow,
  },
  cellText: {
    fontSize: 16,
    color: TW.bgSecondary,
    fontWeight: "400",
  },
  cellTextSelected: {
    color: TW.bgSecondary,
    fontWeight: "800",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 14,
  },
  actionClear: {
    paddingHorizontal: 4,
  },
  actionRight: {
    flexDirection: "row",
    gap: 20,
    paddingRight: 8,
  },
  actionText: {
    color: TW.bgSecondary,
    fontWeight: "700",
    fontSize: 14,
  },
});

export default MonthPickerModal;
