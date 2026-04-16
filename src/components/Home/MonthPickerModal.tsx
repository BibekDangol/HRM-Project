import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import { TW } from "@/theme/twStyles";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { BlurView } from "expo-blur";
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
import { BorderlessButton } from "react-native-gesture-handler";

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
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

const YEAR_ROWS = chunk(YEARS, 3);
const MONTH_ROWS = chunk(MONTHS, 3);

// ─── GridCell ─────────────────────────────────────────────────────────────────
// Uses pill-based selection (Logic approach) — avoids clipping the highlight

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

// ─── ChevronIcon ──────────────────────────────────────────────────────────────

const ChevronIcon = ({ active }: { active: boolean }) =>
  active ? (
    <ChevronDown size={15} color={TW.bgSecondary} />
  ) : (
    <ChevronUp size={15} color={TW.bgSecondary} />
  );

// ─── MonthPickerModal ─────────────────────────────────────────────────────────

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

  // Mount control — keeps the modal in the tree during exit animation
  const [modalMounted, setModalMounted] = useState(visible);
  const isClosing = useRef(false);

  const scrollRef = useRef<ScrollView>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const cardTranslateY = useRef(new Animated.Value(18)).current;

  const shortMonth = useMemo(
    () => MONTHS[selectedMonth]?.slice(0, 3) ?? "",
    [selectedMonth],
  );

  // Mount when visible becomes true
  useEffect(() => {
    if (visible) setModalMounted(true);
  }, [visible]);

  // Entry animation — runs once modal is mounted and visible
  useEffect(() => {
    if (!modalMounted || !visible) return;

    overlayOpacity.setValue(0);
    cardOpacity.setValue(0);
    cardScale.setValue(0.96);
    cardTranslateY.setValue(18);

    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalMounted, visible]);

  // Auto-scroll to selected item whenever mode or selection changes
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

  // Smooth exit animation — unmounts after animation completes
  const animateOut = useCallback(
    (after?: () => void) => {
      if (isClosing.current) return;
      isClosing.current = true;

      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.96,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardTranslateY, {
          toValue: 14,
          duration: 160,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        isClosing.current = false;
        setModalMounted(false);
        after?.();
        onClose();
      });
    },
    [onClose],
  );

  const handleClose = useCallback(() => animateOut(), [animateOut]);

  const handleConfirm = useCallback(
    () => animateOut(() => onConfirm?.()),
    [animateOut, onConfirm],
  );

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
      return;
    }
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setMode("year");
  }, [onClear, setSelectedYear, setSelectedMonth]);

  const switchToYear = useCallback(() => setMode("year"), []);
  const switchToMonth = useCallback(() => setMode("month"), []);

  if (!modalMounted) return null;

  return (
    <Modal
      transparent
      visible={modalMounted}
      animationType="none"
      statusBarTranslucent
    >
      {/* BACKDROP — BlurView + dark scrim */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: overlayOpacity }]}
      >
        <BlurView style={StyleSheet.absoluteFill} intensity={12} tint="dark" />
        <View style={[StyleSheet.absoluteFill, s.scrim]} />
      </Animated.View>

      {/* Tap outside to close */}
      <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

      {/* CARD — animated wrapper is separate from borderRadius/overflow
          to avoid Android clipping bug with transforms + overflow:hidden */}
      <View style={s.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            s.cardAnimated,
            {
              opacity: cardOpacity,
              transform: [
                { scale: cardScale },
                { translateY: cardTranslateY },
              ],
            },
          ]}
        >
          <View style={s.card}>
            <Pressable>

              {/* Header */}
              <View style={s.header}>
                <Text style={s.headerLabel}>Select date</Text>
                <Text style={s.headerDate}>
                  {shortMonth}, {selectedYear}
                </Text>
              </View>

              <View style={s.divider} />

              {/* Mode toggle */}
              <View style={s.toggleRow}>
                <TouchableOpacity onPress={switchToYear} style={s.toggleBtn}>
                  <Text
                    style={[s.toggleText, mode === "year" && s.toggleActive]}
                  >
                    {selectedYear}
                  </Text>
                  <ChevronIcon active={mode === "year"} />
                </TouchableOpacity>

                <TouchableOpacity onPress={switchToMonth} style={s.toggleBtn}>
                  <Text
                    style={[s.toggleText, mode === "month" && s.toggleActive]}
                  >
                    {MONTHS[selectedMonth]}
                  </Text>
                  <ChevronIcon active={mode === "month"} />
                </TouchableOpacity>
              </View>

              {/* Grid */}
              <ScrollView
                ref={scrollRef}
                style={s.grid}
                contentContainerStyle={s.gridContent}
                showsVerticalScrollIndicator={false}
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

              {/* Actions */}
              <View style={s.actions}>
                <TouchableOpacity onPress={handleClear}>
                  <Text style={s.actionText}>Clear</Text>
                </TouchableOpacity>

                <View style={s.actionRight}>
                  <TouchableOpacity onPress={handleClose}>
                    <Text style={s.actionText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleConfirm}>
                    <Text style={s.actionText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scrim: {
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // Animated wrapper — NO borderRadius, NO overflow (avoids Android clipping)
  cardAnimated: {
    width: "100%",
    maxWidth: 380,
  },
  // Visual card — borderRadius + overflow safely isolated here
  card: {
    width: "100%",
    backgroundColor: TW.bgPrimary,
    borderRadius: 28,
    overflow: "hidden",
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
  },
  headerDate: {
    fontSize: 30,
    color: "#fff",
  },
  divider: { height: 1, backgroundColor: "#EEF2F4" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  toggleText: { fontSize: 15, fontWeight: "700", color: TW.bgSecondary },
  toggleActive: {},
  grid: { maxHeight: 280 },
  gridContent: { padding: 8 },
  row: { flexDirection: "row" },
  cellOuter: { flex: 1, alignItems: "center", padding: 7 },
  cellPill: {
    height: 40,
    minWidth: 80,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  cellPillSelected: { backgroundColor: TW.bgYellow, borderRadius:999 },
  cellText: { fontSize: 16, color: TW.bgSecondary },
  cellTextSelected: { fontWeight: "800" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  actionRight: { flexDirection: "row", gap: 20 },
  actionText: { fontWeight: "700", color: TW.bgSecondary },
});

export default MonthPickerModal;