import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ── Brand colours ─────────────────────────────────────────────
const C = {
  teal: "#1B4A5A",
  yellow: "#FFB300",
  surface: "#F0F4F5",
  divider: "#C9D4D7",
  textPrimary: "#0D2B35",
  white: "#FFFFFF",
  overlay: "rgba(0,0,0,0.45)",
};

// Row height = paddingVertical (7) * 2 + cellPill height (40)
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

// ── Grid cell ─────────────────────────────────────────────────
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

// ── Main component ────────────────────────────────────────────
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

  // Auto-scroll to the selected year/month row when the modal opens or mode changes
  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      if (mode === "year") {
        const rowIndex = Math.floor((selectedYear - MIN_YEAR) / 3);
        // Centre the selected row in the 280px viewport (≈ 5 visible rows)
        const y = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT * 2);
        scrollRef.current?.scrollTo({ y, animated: false });
      } else {
        const rowIndex = Math.floor(selectedMonth / 3);
        const y = Math.max(0, rowIndex * ROW_HEIGHT - ROW_HEIGHT);
        scrollRef.current?.scrollTo({ y, animated: false });
      }
    }, 50); // small delay so the ScrollView has laid out

    return () => clearTimeout(timeout);
  }, [visible, mode, selectedYear, selectedMonth]);

  const switchToYear = useCallback(() => setMode("year"), []);
  const switchToMonth = useCallback(() => setMode("month"), []);

  const handleClear = useCallback(() => {
    onClear?.();
  }, [onClear]);

  const handleConfirm = useCallback(() => {
    onConfirm?.();
    onClose();
  }, [onConfirm, onClose]);

  if (!visible) return null;

  const shortMonth = MONTHS[selectedMonth]?.slice(0, 3) ?? "";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.card} onPress={() => {}}>
          {/* ── Header ──────────────────────────────────── */}
          <View style={s.header}>
            <Text style={s.headerLabel}>Select date</Text>
            <Text style={s.headerDate}>
              {shortMonth}, {selectedYear}
            </Text>
          </View>

          <View style={s.divider} />

          {/* ── Mode toggles ────────────────────────────── */}
          <View style={s.toggleRow}>
            <TouchableOpacity
              onPress={switchToYear}
              style={s.toggleBtn}
              activeOpacity={0.7}
            >
              <Text style={[s.toggleText, mode === "year" && s.toggleActive]}>
                {selectedYear}
              </Text>
              <Text style={s.caret}>▲</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={switchToMonth}
              style={s.toggleBtn}
              activeOpacity={0.7}
            >
              <Text style={[s.toggleText, mode === "month" && s.toggleActive]}>
                {MONTHS[selectedMonth]}
              </Text>
              <Text style={s.caret}>▲</Text>
            </TouchableOpacity>
          </View>

          {/* ── Grid ────────────────────────────────────── */}
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

          {/* ── Actions ─────────────────────────────────── */}
          <View style={s.actions}>
            {/* Clear — always shown; calls onClear if provided, else resets */}
            <TouchableOpacity
              onPress={handleClear}
              activeOpacity={0.7}
              style={s.actionClear}
            >
              <Text style={s.actionText}>Clear</Text>
            </TouchableOpacity>

            {/* Cancel + OK shifted left via paddingRight */}
            <View style={s.actionRight}>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={s.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirm} activeOpacity={0.7}>
                <Text style={[s.actionText, s.actionOk]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── StyleSheet ────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: C.surface,
    borderRadius: 28,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  // Header
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: C.teal,
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
    color: C.white,
    letterSpacing: -0.3,
  },
  // Divider
  divider: { height: 1, backgroundColor: C.divider },
  // Toggles
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 6,
  },
  toggleBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  toggleText: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  toggleActive: { color: C.teal },
  caret: { color: C.teal, fontSize: 11 },
  // Grid
  grid: { maxHeight: 280 },
  gridContent: { paddingHorizontal: 8, paddingBottom: 8 },
  row: { flexDirection: "row" },
  // Cell
  cellOuter: { flex: 1, alignItems: "center", paddingVertical: 7 },
  cellPill: {
    height: 40,
    minWidth: 80,
    borderRadius: 999,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  cellPillSelected: { backgroundColor: C.yellow },
  cellText: { fontSize: 16, color: C.textPrimary, fontWeight: "400" },
  cellTextSelected: { color: C.teal, fontWeight: "800" },
  // Actions
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 16,
    paddingRight: 8, // tighter right edge → buttons shift left
    paddingVertical: 14,
  },
  actionClear: {
    paddingHorizontal: 4,
  },
  actionRight: {
    flexDirection: "row",
    gap: 20,
    paddingRight: 8, // nudge Cancel + OK away from the card edge
  },
  actionText: { color: C.teal, fontWeight: "700", fontSize: 14 },
  actionOk: { color: C.teal },
});
