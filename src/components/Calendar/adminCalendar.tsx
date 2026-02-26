import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "twrnc";
import {
  COLOR_PRESETS,
  DAY_OPTIONS,
  parseLocalYMD,
} from "../../constants/adminCalendar";
import { CalendarColors, ModalMode } from "../../types/adminCalendar";
import { calendarStore, useCalendarStore } from "../../utils/adminCalendar";

function Dot({ color, size = 10 }: { color: string; size?: number }) {
  return (
    <View
      style={[
        tw`rounded-full`,
        { width: size, height: size, backgroundColor: color },
      ]}
    />
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={tw`mb-4`}>
      <Text
        style={tw`text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1`}
      >
        {title}
      </Text>
      <View style={tw`bg-white rounded-2xl shadow-sm overflow-hidden`}>
        {children}
      </View>
    </View>
  );
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (c: string) => void;
}) {
  return (
    <View style={tw`flex-row flex-wrap gap-2 mt-2`}>
      {COLOR_PRESETS.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onChange(c)}
          style={[
            tw`w-8 h-8 rounded-full border-2`,
            {
              backgroundColor: c,
              borderColor: value === c ? "#0f172a" : "transparent",
            },
          ]}
        />
      ))}
    </View>
  );
}

// ── Day Pill Selector ─────────────────────────────────────────────────────────
function WeekdaySelector() {
  const store = useCalendarStore();
  const offColor = store.colors.weekend;
  const selectedCount = DAY_OPTIONS.filter(
    (d) => store.weekendRules[d.key],
  ).length;

  return (
    <View style={tw`px-4 py-4`}>
      <View style={tw`flex-row items-center justify-between mb-3`}>
        <Text style={tw`text-sm font-medium text-slate-600`}>
          Off days per week
        </Text>
        <View
          style={[
            tw`px-2.5 py-0.5 rounded-full`,
            { backgroundColor: offColor + "20" },
          ]}
        >
          <Text style={[tw`text-xs font-bold`, { color: offColor }]}>
            {selectedCount} day{selectedCount !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={tw`flex-row gap-1.5`}>
        {DAY_OPTIONS.map(({ key, short }) => {
          const isOff = store.weekendRules[key];
          return (
            <TouchableOpacity
              key={key}
              onPress={() => calendarStore.setWeekendRule(key, !isOff)}
              style={[
                tw`flex-1 items-center py-2.5 rounded-xl`,
                {
                  backgroundColor: isOff ? offColor : offColor + "12",
                  borderWidth: 1.5,
                  borderColor: isOff ? offColor : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  tw`text-xs font-bold`,
                  { color: isOff ? "white" : "#94a3b8" },
                ]}
              >
                {short}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedCount > 0 && (
        <View style={tw`mt-3 flex-row flex-wrap gap-1.5`}>
          {DAY_OPTIONS.filter((d) => store.weekendRules[d.key]).map((d) => (
            <View
              key={d.key}
              style={[
                tw`flex-row items-center gap-1 px-2 py-0.5 rounded-full`,
                { backgroundColor: offColor + "15" },
              ]}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: offColor,
                }}
              />
              <Text style={[tw`text-xs font-medium`, { color: offColor }]}>
                {d.full}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function StatPill({
  label,
  count,
  color,
}: {
  label: string; 
  count: number;
  color: string;
}) {
  return (
    <View
      style={[
        tw`flex-1 items-center py-3 rounded-2xl`,
        { backgroundColor: color + "18" },
      ]}
    >
      <Text style={[tw`text-xl font-extrabold`, { color }]}>{count}</Text>
      <Text style={[tw`text-xs font-semibold mt-0.5`, { color: color + "cc" }]}>
        {label}
      </Text>
    </View>
  );
}

// ── Day Detail Modal ──────────────────────────────────────────────────────────
export function DayModal({
  visible,
  dateStr,
  onClose,
}: {
  visible: boolean;
  dateStr: string;
  onClose: () => void;
}) {
  const store = useCalendarStore();
  const [mode, setMode] = useState<ModalMode>("view");
  const [inputText, setInputText] = useState("");
  const [eventColor, setEventColor] = useState("#3B82F6");

  const cfg = store.days[dateStr];
  const dayType = calendarStore.getDayType(dateStr);

  const typeColor =
    dayType === "publicHoliday"
      ? store.colors.publicHoliday
      : dayType === "weekend"
        ? store.colors.weekend
        : store.colors.officeDay;

  const typeLabel =
    dayType === "publicHoliday"
      ? "Public Holiday"
      : dayType === "weekend"
        ? "Off Day"
        : "Office Day";

  const displayDate = dateStr
    ? parseLocalYMD(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  function close() {
    Keyboard.dismiss();
    setMode("view");
    setInputText("");
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={tw`flex-1`}>
          {/* Backdrop */}
          <Pressable style={tw`absolute inset-0 bg-black/40`} onPress={close} />

          {/* Sheet */}
          <View style={tw`mt-auto bg-slate-50 rounded-t-3xl pt-3 px-5 pb-8`}>
            <View
              style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`}
            />

            {mode === "view" && (
              <>
                <Text style={tw`text-lg font-bold text-slate-900`}>
                  {displayDate}
                </Text>
                <View style={tw`flex-row items-center gap-2 mt-1 mb-4`}>
                  <Dot color={typeColor} size={9} />
                  <Text
                    style={[tw`text-sm font-semibold`, { color: typeColor }]}
                  >
                    {typeLabel}
                  </Text>
                </View>

                {cfg?.holidayLabel && (
                  <View
                    style={[
                      tw`flex-row items-center justify-between p-3 rounded-xl mb-3`,
                      { backgroundColor: store.colors.publicHoliday + "18" },
                    ]}
                  >
                    <View style={tw`flex-row items-center gap-2`}>
                      <Text
                        style={[
                          tw`text-sm font-semibold`,
                          { color: store.colors.publicHoliday },
                        ]}
                      >
                        {cfg.holidayLabel}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => calendarStore.removeHoliday(dateStr)}
                      hitSlop={10}
                    >
                      <Text style={tw`text-red-400 font-bold text-base`}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(cfg?.events ?? []).map((ev) => (
                  <View
                    key={ev.id}
                    style={[
                      tw`flex-row items-center justify-between p-3 rounded-xl mb-2`,
                      { backgroundColor: ev.color + "18" },
                    ]}
                  >
                    <View style={tw`flex-row items-center gap-2`}>
                      <Dot color={ev.color} size={8} />
                      <Text
                        style={[tw`text-sm font-medium`, { color: ev.color }]}
                      >
                        {ev.label}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => calendarStore.removeEvent(dateStr, ev.id)}
                      hitSlop={10}
                    >
                      <Text style={tw`text-red-400 font-bold text-base`}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={tw`flex-row gap-3 mt-4`}>
                  <TouchableOpacity
                    onPress={() => setMode("addHoliday")}
                    style={[
                      tw`flex-1 py-3 rounded-xl items-center`,
                      { backgroundColor: store.colors.publicHoliday + "22" },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-sm font-bold`,
                        { color: store.colors.publicHoliday },
                      ]}
                    >
                      Add Holiday
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setMode("addEvent")}
                    style={tw`flex-1 py-3 rounded-xl items-center bg-blue-50`}
                  >
                    <Text style={tw`text-sm font-bold text-blue-600`}>
                      Add Event
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={close}
                  style={tw`mt-3 py-3 rounded-xl items-center bg-slate-100`}
                >
                  <Text style={tw`text-sm font-semibold text-slate-500`}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "addHoliday" && (
              <>
                <Text style={tw`text-lg font-bold text-slate-900 mb-1`}>
                  Add Public Holiday
                </Text>
                <Text style={tw`text-sm text-slate-400 mb-4`}>
                  {displayDate}
                </Text>

                <TextInput
                  autoFocus
                  placeholder="e.g. New Year's Day"
                  placeholderTextColor="#94a3b8"
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const v = inputText.trim();
                    if (!v) return;
                    calendarStore.setHoliday(dateStr, v);
                    setInputText("");
                    setMode("view");
                  }}
                  style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm mb-4`}
                />

                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    onPress={() => {
                      const v = inputText.trim();
                      if (!v) return;
                      calendarStore.setHoliday(dateStr, v);
                      setInputText("");
                      setMode("view");
                    }}
                    style={[
                      tw`flex-1 py-3 rounded-xl items-center`,
                      { backgroundColor: store.colors.publicHoliday },
                    ]}
                  >
                    <Text style={tw`text-sm font-bold text-white`}>Add</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInputText("");
                      setMode("view");
                    }}
                    style={tw`flex-1 py-3 rounded-xl items-center bg-slate-100`}
                  >
                    <Text style={tw`text-sm font-semibold text-slate-500`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mode === "addEvent" && (
              <>
                <Text style={tw`text-lg font-bold text-slate-900 mb-1`}>
                  Add Event
                </Text>
                <Text style={tw`text-sm text-slate-400 mb-4`}>
                  {displayDate}
                </Text>

                <TextInput
                  autoFocus
                  placeholder="Event name"
                  placeholderTextColor="#94a3b8"
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const v = inputText.trim();
                    if (!v) return;
                    calendarStore.addEvent(dateStr, v, eventColor);
                    setInputText("");
                    setEventColor("#3B82F6");
                    setMode("view");
                  }}
                  style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm mb-3`}
                />

                <Text
                  style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}
                >
                  Colour
                </Text>
                <ColorPicker value={eventColor} onChange={setEventColor} />

                <View style={tw`flex-row gap-3 mt-4`}>
                  <TouchableOpacity
                    onPress={() => {
                      const v = inputText.trim();
                      if (!v) return;
                      calendarStore.addEvent(dateStr, v, eventColor);
                      setInputText("");
                      setEventColor("#3B82F6");
                      setMode("view");
                    }}
                    style={[
                      tw`flex-1 py-3 rounded-xl items-center`,
                      { backgroundColor: eventColor },
                    ]}
                  >
                    <Text style={tw`text-sm font-bold text-white`}>
                      Add Event
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInputText("");
                      setMode("view");
                    }}
                    style={tw`flex-1 py-3 rounded-xl items-center bg-slate-100`}
                  >
                    <Text style={tw`text-sm font-semibold text-slate-500`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────────────
export function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const store = useCalendarStore();

  const colorRows = [
    { key: "publicHoliday" as keyof CalendarColors, label: "Public Holiday" },
    { key: "weekend" as keyof CalendarColors, label: "Weekend / Off Day" },
    { key: "officeDay" as keyof CalendarColors, label: "Office Day" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={tw`flex-1 bg-black/40`} onPress={onClose} />

      {/* Sheet */}
      <View style={tw`bg-slate-50 rounded-t-3xl pt-3 px-5 pb-10 max-h-[80%]`}>
        <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`} />
        <Text style={tw`text-lg font-bold text-slate-900 mb-5`}>
          Admin Settings
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SectionCard title="Day Type Colours">
            {colorRows.map(({ key, label }, i) => (
              <View
                key={key}
                style={[
                  tw`px-4 py-3`,
                  i < colorRows.length - 1 && tw`border-b border-slate-100`,
                ]}
              >
                <View style={tw`flex-row items-center gap-3 mb-1`}>
                  <Text style={tw`text-sm font-semibold text-slate-700`}>
                    {label}
                  </Text>
                  <View
                    style={[
                      tw`ml-auto w-5 h-5 rounded-full`,
                      { backgroundColor: store.colors[key] },
                    ]}
                  />
                </View>

                <ColorPicker
                  value={store.colors[key]}
                  onChange={(c) => calendarStore.setColor(key, c)}
                />
              </View>
            ))}
          </SectionCard>

          <SectionCard title="Off Days">
            <WeekdaySelector />
          </SectionCard>

          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Reset Calendar",
                "Clear all holidays, events and settings?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                      calendarStore.reset();
                      onClose();
                    },
                  },
                ],
              )
            }
            style={tw`py-3 rounded-xl items-center bg-red-50 border border-red-100 mb-6`}
          >
            <Text style={tw`text-sm font-semibold text-red-500`}>
              Reset All Calendar Data
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}
