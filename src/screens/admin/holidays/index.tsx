import React, { useEffect, useMemo, useState as useReactState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import tw from "twrnc";

export interface CalendarEvent {
  id: string;
  label: string;
  color: string;
}
export interface DayConfig {
  type?: "publicHoliday" | "officeDay";
  holidayLabel?: string;
  events?: CalendarEvent[];
}
export interface CalendarColors {
  publicHoliday: string;
  weekend: string;
  officeDay: string;
}
export interface WeekendRules {
  saturdayOff: boolean;
  sundayOff: boolean;
}
export interface CalendarState {
  colors: CalendarColors;
  weekendRules: WeekendRules;
  days: Record<string, DayConfig>;
}

const DEFAULT_STATE: CalendarState = {
  colors: { publicHoliday: "#EF4444", weekend: "#A855F7", officeDay: "#22C55E" },
  weekendRules: { saturdayOff: true, sundayOff: true },
  days: {},
};

let _state: CalendarState = JSON.parse(JSON.stringify(DEFAULT_STATE));
const _listeners = new Set<() => void>();
const _notify = () => _listeners.forEach((fn) => fn());

export const calendarStore = {
  subscribe(fn: () => void) {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },
  getState(): CalendarState { return _state; },
  getDayType(dateStr: string): "publicHoliday" | "weekend" | "officeDay" {
    const cfg = _state.days[dateStr];
    if (cfg?.type === "publicHoliday") return "publicHoliday";
    if (cfg?.type === "officeDay")     return "officeDay";
    const dow = new Date(dateStr).getDay();
    if (dow === 0 && _state.weekendRules.sundayOff)   return "weekend";
    if (dow === 6 && _state.weekendRules.saturdayOff) return "weekend";
    return "officeDay";
  },
  setColor(key: keyof CalendarColors, value: string) {
    _state = { ..._state, colors: { ..._state.colors, [key]: value } }; _notify();
  },
  setWeekendRule(key: keyof WeekendRules, value: boolean) {
    _state = { ..._state, weekendRules: { ..._state.weekendRules, [key]: value } }; _notify();
  },
  setHoliday(dateStr: string, label: string) {
    _state = { ..._state, days: { ..._state.days, [dateStr]: { ...(_state.days[dateStr] ?? {}), type: "publicHoliday", holidayLabel: label } } };
    _notify();
  },
  removeHoliday(dateStr: string) {
    const { type: _t, holidayLabel: _l, ...rest } = _state.days[dateStr] ?? {};
    _state = { ..._state, days: { ..._state.days, [dateStr]: rest as DayConfig } }; _notify();
  },
  addEvent(dateStr: string, label: string, color: string) {
    const ev: CalendarEvent = { id: `${Date.now()}-${Math.random()}`, label, color };
    _state = { ..._state, days: { ..._state.days, [dateStr]: { ...(_state.days[dateStr] ?? {}), events: [...(_state.days[dateStr]?.events ?? []), ev] } } };
    _notify();
  },
  removeEvent(dateStr: string, eventId: string) {
    _state = { ..._state, days: { ..._state.days, [dateStr]: { ...(_state.days[dateStr] ?? {}), events: (_state.days[dateStr]?.events ?? []).filter(e => e.id !== eventId) } } };
    _notify();
  },
  reset() { _state = JSON.parse(JSON.stringify(DEFAULT_STATE)); _notify(); },
};

/** Reactive hook — use in any screen to auto-rerender on admin changes. */
export function useCalendarStore(): CalendarState {
  const [s, setS] = useReactState<CalendarState>(calendarStore.getState());
  useEffect(() => {
    return calendarStore.subscribe(() => setS(calendarStore.getState()));
  }, []);
  return s;
}

/** Build markedDates (markingType="custom") from store state + a given month. */
export function buildAdminMarks(state: CalendarState, year: number, month: number): Record<string, any> {
  const marks: Record<string, any> = {};
  const total = new Date(year, month, 0).getDate();
  for (let d = 1; d <= total; d++) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const type  = calendarStore.getDayType(key);
    const color = type === "publicHoliday" ? state.colors.publicHoliday
                : type === "weekend"       ? state.colors.weekend
                :                            state.colors.officeDay;
    marks[key] = {
      customStyles: {
        container: { backgroundColor: type !== "officeDay" ? color + "30" : "transparent", borderRadius: 8 },
        text:      { color: type !== "officeDay" ? color : "#0f172a", fontWeight: type !== "officeDay" ? "700" : "400" },
      },
      dots: (state.days[key]?.events ?? []).map(ev => ({ key: ev.id, color: ev.color })),
    };
  }
  return marks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② DATE RANGE HELPERS  (mirrored from LeaveCalendarScreen)
// ═══════════════════════════════════════════════════════════════════════════════

function parseISO(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

function isBeforeOrEqual(a: string, b: string) {
  return a <= b;
}

function buildPeriodMarks(start: string, end: string): Record<string, any> {
  const marks: Record<string, any> = {};
  const s = parseISO(start);
  const e = parseISO(end);
  if (!s || !e) return marks;

  const cur = new Date(s.getTime());
  while (cur.getTime() <= e.getTime()) {
    const y = cur.getUTCFullYear();
    const m = String(cur.getUTCMonth() + 1).padStart(2, "0");
    const d = String(cur.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;

    marks[key] = {
      startingDay: key === start,
      endingDay: key === end,
      color: "#2563eb",
      textColor: "white",
    };

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return marks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ UI HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_PRESETS = ["#EF4444","#F97316","#EAB308","#22C55E","#06B6D4","#3B82F6","#8B5CF6","#EC4899","#64748B","#000000"];

function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return <View style={[tw`rounded-full`, { width: size, height: size, backgroundColor: color }]} />;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1`}>{title}</Text>
      <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>{children}</View>
    </View>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <View style={tw`flex-row flex-wrap gap-2 mt-2`}>
      {COLOR_PRESETS.map(c => (
        <TouchableOpacity key={c} onPress={() => onChange(c)}
          style={[tw`w-8 h-8 rounded-full border-2`, { backgroundColor: c, borderColor: value === c ? "#0f172a" : "transparent" }]} />
      ))}
    </View>
  );
}

function StatPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[tw`flex-1 items-center py-3 rounded-2xl`, { backgroundColor: color + "18" }]}>
      <Text style={[tw`text-xl font-extrabold`, { color }]}>{count}</Text>
      <Text style={[tw`text-xs font-semibold mt-0.5`, { color: color + "cc" }]}>{label}</Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ DAY DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════════════════

type ModalMode = "view" | "addHoliday" | "addEvent";

function DayModal({ visible, dateStr, onClose }: { visible: boolean; dateStr: string; onClose: () => void }) {
  const store = useCalendarStore();
  const [mode, setMode]             = useReactState<ModalMode>("view");
  const [inputText, setInputText]   = useReactState("");
  const [eventColor, setEventColor] = useReactState("#3B82F6");

  const cfg      = store.days[dateStr];
  const dayType  = calendarStore.getDayType(dateStr);
  const typeColor = dayType === "publicHoliday" ? store.colors.publicHoliday
                  : dayType === "weekend"       ? store.colors.weekend
                  :                               store.colors.officeDay;
  const typeLabel = dayType === "publicHoliday" ? "Public Holiday"
                  : dayType === "weekend"       ? "Off Day"
                  :                               "Office Day";
  const displayDate = dateStr
    ? new Date(dateStr).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  function close() { setMode("view"); setInputText(""); onClose(); }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={tw`flex-1 bg-black/40`} onPress={close} />
      <View style={tw`bg-slate-50 rounded-t-3xl pt-3 px-5 pb-8`}>
        <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`} />

        {/* VIEW */}
        {mode === "view" && (
          <>
            <Text style={tw`text-lg font-bold text-slate-900`}>{displayDate}</Text>
            <View style={tw`flex-row items-center gap-2 mt-1 mb-4`}>
              <Dot color={typeColor} size={9} />
              <Text style={[tw`text-sm font-semibold`, { color: typeColor }]}>{typeLabel}</Text>
            </View>

            {cfg?.holidayLabel && (
              <View style={[tw`flex-row items-center justify-between p-3 rounded-xl mb-3`, { backgroundColor: store.colors.publicHoliday + "18" }]}>
                <View style={tw`flex-row items-center gap-2`}>
                  <Text>🎉</Text>
                  <Text style={[tw`text-sm font-semibold`, { color: store.colors.publicHoliday }]}>{cfg.holidayLabel}</Text>
                </View>
                <TouchableOpacity onPress={() => calendarStore.removeHoliday(dateStr)} hitSlop={10}>
                  <Text style={tw`text-red-400 font-bold text-base`}>✕</Text>
                </TouchableOpacity>
              </View>
            )}

            {(cfg?.events ?? []).map(ev => (
              <View key={ev.id} style={[tw`flex-row items-center justify-between p-3 rounded-xl mb-2`, { backgroundColor: ev.color + "18" }]}>
                <View style={tw`flex-row items-center gap-2`}>
                  <Dot color={ev.color} size={8} />
                  <Text style={[tw`text-sm font-medium`, { color: ev.color }]}>{ev.label}</Text>
                </View>
                <TouchableOpacity onPress={() => calendarStore.removeEvent(dateStr, ev.id)} hitSlop={10}>
                  <Text style={tw`text-red-400 font-bold text-base`}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={tw`flex-row gap-3 mt-4`}>
              <TouchableOpacity onPress={() => setMode("addHoliday")}
                style={[tw`flex-1 py-3 rounded-xl items-center`, { backgroundColor: store.colors.publicHoliday + "22" }]}>
                <Text style={[tw`text-sm font-bold`, { color: store.colors.publicHoliday }]}>🎉 Add Holiday</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("addEvent")} style={tw`flex-1 py-3 rounded-xl items-center bg-blue-50`}>
                <Text style={tw`text-sm font-bold text-blue-600`}>📌 Add Event</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={close} style={tw`mt-3 py-3 rounded-xl items-center bg-slate-100`}>
              <Text style={tw`text-sm font-semibold text-slate-500`}>Close</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ADD HOLIDAY */}
        {mode === "addHoliday" && (
          <>
            <Text style={tw`text-lg font-bold text-slate-900 mb-1`}>Add Public Holiday</Text>
            <Text style={tw`text-sm text-slate-400 mb-4`}>{displayDate}</Text>
            <TextInput autoFocus placeholder="e.g. New Year's Day" placeholderTextColor="#94a3b8"
              value={inputText} onChangeText={setInputText} returnKeyType="done"
              onSubmitEditing={() => { if (!inputText.trim()) return; calendarStore.setHoliday(dateStr, inputText.trim()); setInputText(""); setMode("view"); }}
              style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm mb-4`} />
            <View style={tw`flex-row gap-3`}>
              <TouchableOpacity onPress={() => { if (!inputText.trim()) return; calendarStore.setHoliday(dateStr, inputText.trim()); setInputText(""); setMode("view"); }}
                style={[tw`flex-1 py-3 rounded-xl items-center`, { backgroundColor: store.colors.publicHoliday }]}>
                <Text style={tw`text-sm font-bold text-white`}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setInputText(""); setMode("view"); }} style={tw`flex-1 py-3 rounded-xl items-center bg-slate-100`}>
                <Text style={tw`text-sm font-semibold text-slate-500`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ADD EVENT */}
        {mode === "addEvent" && (
          <>
            <Text style={tw`text-lg font-bold text-slate-900 mb-1`}>Add Event</Text>
            <Text style={tw`text-sm text-slate-400 mb-4`}>{displayDate}</Text>
            <TextInput autoFocus placeholder="Event name" placeholderTextColor="#94a3b8"
              value={inputText} onChangeText={setInputText} returnKeyType="done"
              onSubmitEditing={() => { if (!inputText.trim()) return; calendarStore.addEvent(dateStr, inputText.trim(), eventColor); setInputText(""); setEventColor("#3B82F6"); setMode("view"); }}
              style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm mb-3`} />
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}>Colour</Text>
            <ColorPicker value={eventColor} onChange={setEventColor} />
            <View style={tw`flex-row gap-3 mt-4`}>
              <TouchableOpacity onPress={() => { if (!inputText.trim()) return; calendarStore.addEvent(dateStr, inputText.trim(), eventColor); setInputText(""); setEventColor("#3B82F6"); setMode("view"); }}
                style={[tw`flex-1 py-3 rounded-xl items-center`, { backgroundColor: eventColor }]}>
                <Text style={tw`text-sm font-bold text-white`}>Add Event</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setInputText(""); setMode("view"); }} style={tw`flex-1 py-3 rounded-xl items-center bg-slate-100`}>
                <Text style={tw`text-sm font-semibold text-slate-500`}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ SETTINGS MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const store = useCalendarStore();
  const colorRows = [
    { key: "publicHoliday" as keyof CalendarColors, label: "Public Holiday", emoji: "🎉" },
    { key: "weekend"       as keyof CalendarColors, label: "Weekend / Off Day", emoji: "🔴" },
    { key: "officeDay"     as keyof CalendarColors, label: "Office Day", emoji: "🟢" },
  ];
  const weekendRows = [
    { key: "saturdayOff" as keyof WeekendRules, label: "Saturday Off" },
    { key: "sundayOff"   as keyof WeekendRules, label: "Sunday Off" },
  ];
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={tw`flex-1 bg-black/40`} onPress={onClose} />
      <View style={tw`bg-slate-50 rounded-t-3xl pt-3 px-5 pb-10 max-h-[80%]`}>
        <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`} />
        <Text style={tw`text-lg font-bold text-slate-900 mb-5`}>⚙️ Admin Settings</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SectionCard title="Day Type Colours">
            {colorRows.map(({ key, label, emoji }, i) => (
              <View key={key} style={[tw`px-4 py-3`, i < colorRows.length - 1 && tw`border-b border-slate-100`]}>
                <View style={tw`flex-row items-center gap-3 mb-1`}>
                  <Text>{emoji}</Text>
                  <Text style={tw`text-sm font-semibold text-slate-700`}>{label}</Text>
                  <View style={[tw`ml-auto w-5 h-5 rounded-full`, { backgroundColor: store.colors[key] }]} />
                </View>
                <ColorPicker value={store.colors[key]} onChange={c => calendarStore.setColor(key, c)} />
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Weekend Rules">
            {weekendRows.map(({ key, label }, i) => (
              <View key={key} style={[tw`flex-row items-center justify-between px-4 py-3`, i < weekendRows.length - 1 && tw`border-b border-slate-100`]}>
                <Text style={tw`text-sm font-medium text-slate-700`}>{label}</Text>
                <Switch value={store.weekendRules[key]} onValueChange={v => calendarStore.setWeekendRule(key, v)}
                  trackColor={{ true: "#6366F1", false: "#e2e8f0" }} thumbColor="white" />
              </View>
            ))}
          </SectionCard>

          <TouchableOpacity
            onPress={() => Alert.alert("Reset Calendar", "Clear all holidays, events and settings?", [
              { text: "Cancel", style: "cancel" },
              { text: "Reset", style: "destructive", onPress: () => { calendarStore.reset(); onClose(); } },
            ])}
            style={tw`py-3 rounded-xl items-center bg-red-50 border border-red-100 mb-6`}>
            <Text style={tw`text-sm font-semibold text-red-500`}>Reset All Calendar Data</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑥ ADMIN SCREEN — default export
// ═══════════════════════════════════════════════════════════════════════════════

export default function AdminCalendarScreen() {
  const store = useCalendarStore();
  const today = new Date();
  const [year, setYear]   = useReactState(today.getFullYear());
  const [month, setMonth] = useReactState(today.getMonth() + 1);

  // ── Period-selection state (mirrors LeaveCalendarScreen) ──────────────────
  const [selectedStart, setSelectedStart] = useReactState<string>("");
  const [selectedEnd, setSelectedEnd]     = useReactState<string>("");

  // ── Day modal state ────────────────────────────────────────────────────────
  const [selDate, setSelDate]           = useReactState("");
  const [showDay, setShowDay]           = useReactState(false);
  const [showSettings, setShowSettings] = useReactState(false);

  // ── Merged marks: period overlay takes priority when actively selecting ───
  const markedDates = useMemo(() => {
    // If a range (or single start) is in progress, show the period highlight
    if (selectedStart && selectedEnd) {
      const start = isBeforeOrEqual(selectedStart, selectedEnd) ? selectedStart : selectedEnd;
      const end   = isBeforeOrEqual(selectedStart, selectedEnd) ? selectedEnd   : selectedStart;
      return buildPeriodMarks(start, end);
    }
    if (selectedStart && !selectedEnd) {
      return {
        [selectedStart]: {
          startingDay: true,
          endingDay: true,
          color: "#2563eb",
          textColor: "white",
        },
      };
    }
    // No selection active — fall back to admin colour-coding
    return buildAdminMarks(store, year, month);
  }, [selectedStart, selectedEnd, store, year, month]);

  // ── markingType switches based on whether a selection is active ───────────
  const markingType = selectedStart ? "period" : "custom";

  // ── Same two-tap logic as LeaveCalendarScreen ─────────────────────────────
  const onDayPress = (day: { dateString: string }) => {
    const dateStr = day.dateString;

    // First tap — set start date
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(dateStr);
      setSelectedEnd("");
      return;
    }

    // Second tap — complete the range, then open the modal for the start day
    const start = selectedStart;
    const end   = dateStr;

    const finalStart = isBeforeOrEqual(start, end) ? start : end;
    const finalEnd   = isBeforeOrEqual(start, end) ? end   : start;

    setSelectedStart(finalStart);
    setSelectedEnd(finalEnd);

    // Open the day-detail modal anchored to the start of the selected range
    setSelDate(finalStart);
    setShowDay(true);
  };

  // ── Stats (unchanged) ─────────────────────────────────────────────────────
  const daysInMonth = new Date(year, month, 0).getDate();
  const stats = useMemo(() => {
    let holidays = 0, weekends = 0, office = 0, events = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const t = calendarStore.getDayType(key);
      if (t === "publicHoliday") holidays++;
      else if (t === "weekend")  weekends++;
      else                       office++;
      events += store.days[key]?.events?.length ?? 0;
    }
    return { holidays, weekends, office, events };
  }, [store, year, month, daysInMonth]);

  const monthItems = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`;
    return Object.entries(store.days)
      .filter(([k]) => k.startsWith(prefix))
      .flatMap(([key, cfg]) => [
        ...(cfg.holidayLabel ? [{ key, label: `🎉 ${cfg.holidayLabel}`, color: store.colors.publicHoliday, tag: "Holiday" }] : []),
        ...(cfg.events ?? []).map(ev => ({ key, label: ev.label, color: ev.color, tag: "Event" })),
      ]);
  }, [store, year, month]);

  return (
    <SafeAreaView style={tw`flex-1 bg-slate-100`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-5 pt-2 pb-3`}>
        <View>
          <Text style={tw`text-xl font-extrabold text-slate-900`}>📅 Calendar Admin</Text>
          <Text style={tw`text-xs text-slate-400 mt-0.5`}>
            {selectedStart && !selectedEnd
              ? "Tap again for end date"
              : "Tap once for start date, tap again for end date"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettings(true)}
          style={tw`w-10 h-10 rounded-full bg-white shadow items-center justify-center`}>
          <Text style={tw`text-lg`}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Legend */}
        <View style={tw`flex-row gap-4 px-5 mb-3`}>
          {([["publicHoliday","Holiday"],["weekend","Off Day"],["officeDay","Work"]] as const).map(([k, l]) => (
            <View key={k} style={tw`flex-row items-center gap-1.5`}>
              <Dot color={store.colors[k]} size={9} />
              <Text style={tw`text-xs text-slate-500`}>{l}</Text>
            </View>
          ))}
        </View>

        {/* Selected range display — mirrors LeaveCalendarScreen */}
        <View style={tw`mx-4 mb-3`}>
          <Text style={tw`text-slate-700 font-semibold`}>
            Selected: {selectedStart || "-"}{" "}
            {selectedEnd ? `→ ${selectedEnd}` : ""}
          </Text>
        </View>

        {/* Calendar */}
        <View style={tw`mx-4 rounded-2xl overflow-hidden shadow-sm bg-white mb-4`}>
          <Calendar
            current={`${year}-${String(month).padStart(2, "0")}-01`}
            onDayPress={onDayPress}
            onMonthChange={m => {
              setYear(m.year);
              setMonth(m.month);
              // Clear selection when navigating months
              setSelectedStart("");
              setSelectedEnd("");
            }}
            markingType={markingType as any}
            markedDates={markedDates}
            enableSwipeMonths
            theme={{
              backgroundColor: "white",
              calendarBackground: "white",
              textSectionTitleColor: "#64748b",
              dayTextColor: "#0f172a",
              monthTextColor: "#0f172a",
              arrowColor: "#6366F1",
              todayTextColor: "#6366F1",
              todayBackgroundColor: "#EEF2FF",
              textDayFontWeight: "500",
              textMonthFontWeight: "700",
              textDayHeaderFontSize: 12,
            }}
          />
        </View>

        {/* Stats */}
        <View style={tw`mx-4 mb-4`}>
          <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2`}>This Month</Text>
          <View style={tw`flex-row gap-2`}>
            <StatPill label="Holidays"  count={stats.holidays} color={store.colors.publicHoliday} />
            <StatPill label="Off Days"  count={stats.weekends} color={store.colors.weekend} />
            <StatPill label="Work Days" count={stats.office}   color={store.colors.officeDay} />
            <StatPill label="Events"    count={stats.events}   color="#6366F1" />
          </View>
        </View>

        {/* Event & holiday list */}
        {monthItems.length > 0 && (
          <View style={tw`mx-4 mb-6`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2`}>Events & Holidays</Text>
            <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
              {monthItems.map((item, i) => (
                <View key={`${item.key}-${i}`}
                  style={[tw`flex-row items-center gap-3 px-4 py-3`, i < monthItems.length - 1 && tw`border-b border-slate-50`]}>
                  <Dot color={item.color} size={10} />
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs text-slate-400`}>
                      {item.key.split("-")[2]} {new Date(item.key).toLocaleDateString("en-US", { month: "short" })}
                    </Text>
                    <Text style={tw`text-sm font-medium text-slate-700`}>{item.label}</Text>
                  </View>
                  <View style={[tw`px-2 py-0.5 rounded-full`, { backgroundColor: item.color + "20" }]}>
                    <Text style={[tw`text-xs font-semibold`, { color: item.color }]}>{item.tag}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <DayModal      visible={showDay}      dateStr={selDate} onClose={() => { setShowDay(false); setSelectedStart(""); setSelectedEnd(""); }} />
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
    </SafeAreaView>
  );
}