import { colors } from "@/theme/colors";
import { parseLocalYMD } from "@/src/constants/adminCalendar";
import { supabase } from "@/src/supabase/supabaseClient";
import { ModalMode } from "@/src/types/Calendar";
import { calendarStore, useCalendarStore } from "@/src/utils/adminCalendar";

import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import tw from "@/theme/tw";
import { ColorPicker } from "./ColorPicker";
import { Dot } from "./Dot";

export function DayModal({
  visible,
  dateStr,
  onClose,
  currentUserId,
  currentOrgId,
}: {
  visible: boolean;
  dateStr: string;
  onClose: () => void;
  currentUserId: string;
  currentOrgId: string;
}) {
  const store = useCalendarStore();
  const [mode, setMode] = useState<ModalMode>("view");
  const [inputText, setInputText] = useState("");
  const [eventColor, setEventColor] = useState(colors.primary);

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

  const addHoliday = async (title: string) => {
    const orgId = Number(currentOrgId);

    const { error } = await supabase.from("admin_calendar").insert([
      {
        organization_id: orgId,
        user_id: currentUserId,
        start_date: dateStr,
        end_date: dateStr,
        title,
        type: "holiday",
        color: store.colors.publicHoliday,
      },
    ]);

    if (error) {
      return;
    }

    calendarStore.setHoliday(dateStr, title);
    setInputText("");
    setMode("view");
  };
  const addEvent = async (label: string, color: string) => {
    const orgId = Number(currentOrgId);

    const { error } = await supabase.from("admin_calendar").insert([
      {
        organization_id: orgId,
        user_id: currentUserId,
        start_date: dateStr,
        end_date: dateStr,
        title: label,
        type: "event",
        color: color,
      },
    ]);

    if (error) {
      return;
    }

    calendarStore.addEvent(dateStr, label, color);
    setInputText("");
    setEventColor(colors.primary);
    setMode("view");
  };

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
          <Pressable style={tw`absolute inset-0 bg-black/40`} onPress={close} />

          <View style={tw`mt-auto bg-slate-50 rounded-t-3xl pt-3 px-5 pb-8`}>
            <View
              style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-4`}
            />

            {mode === "view" && (
              <>
                <Text style={tw`text-section font-bold text-slate-900`}>
                  {displayDate}
                </Text>

                <View style={tw`flex-row items-center gap-2 mt-1 mb-4`}>
                  <Dot color={typeColor} size={9} />
                  <Text
                    style={[tw`text-description font-semibold`, { color: typeColor }]}
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
                          tw`text-description font-semibold`,
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
                      <Text style={tw`text-red-400 font-bold text-body`}>
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
                        style={[tw`text-description font-medium`, { color: ev.color }]}
                      >
                        {ev.label}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => calendarStore.removeEvent(dateStr, ev.id)}
                      hitSlop={10}
                    >
                      <Text style={tw`text-red-400 font-bold text-body`}>
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
                        tw`text-description font-bold`,
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
                    <Text style={tw`text-description font-bold text-blue-600`}>
                      Add Event
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={close}
                  style={tw`mt-3 py-3 rounded-xl items-center bg-slate-100`}
                >
                  <Text style={tw`text-description font-semibold text-slate-500`}>
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === "addHoliday" && (
              <>
                <Text style={tw`text-section font-bold text-slate-900 mb-1`}>
                  Add Public Holiday
                </Text>
                <Text style={tw`text-description text-slate-400 mb-4`}>
                  {displayDate}
                </Text>

                <TextInput
                  autoFocus
                  placeholder="e.g. New Year's Day"
                  placeholderTextColor={colors.placeholder}
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const v = inputText.trim();
                    if (!v) return;
                    addHoliday(v);
                  }}
                  style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-description mb-4`}
                />

                <View style={tw`flex-row gap-3`}>
                  <TouchableOpacity
                    onPress={() => {
                      const v = inputText.trim();
                      if (!v) return;
                      addHoliday(v);
                    }}
                    style={[
                      tw`flex-1 py-3 rounded-xl items-center`,
                      { backgroundColor: store.colors.publicHoliday },
                    ]}
                  >
                    <Text style={tw`text-description font-bold text-white`}>Add</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setInputText("");
                      setMode("view");
                    }}
                    style={tw`flex-1 py-3 rounded-xl items-center bg-slate-100`}
                  >
                    <Text style={tw`text-description font-semibold text-slate-500`}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {mode === "addEvent" && (
              <>
                <Text style={tw`text-section font-bold text-slate-900 mb-1`}>
                  Add Event
                </Text>
                <Text style={tw`text-description text-slate-400 mb-4`}>
                  {displayDate}
                </Text>

                <TextInput
                  autoFocus
                  placeholder="Event name"
                  placeholderTextColor={colors.placeholder}
                  value={inputText}
                  onChangeText={setInputText}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    const v = inputText.trim();
                    if (!v) return;
                    addEvent(v, eventColor);
                  }}
                  style={tw`bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-description mb-3`}
                />

                <Text
                  style={tw`text-caption font-bold text-slate-400 uppercase tracking-wider mb-2`}
                >
                  Colour
                </Text>
                <ColorPicker value={eventColor} onChange={setEventColor} />

                <View style={tw`flex-row gap-3 mt-4`}>
                  <TouchableOpacity
                    onPress={() => {
                      const v = inputText.trim();
                      if (!v) return;
                      addEvent(v, eventColor);
                    }}
                    style={[
                      tw`flex-1 py-3 rounded-xl items-center`,
                      { backgroundColor: eventColor },
                    ]}
                  >
                    <Text style={tw`text-description font-bold text-white`}>
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
                    <Text style={tw`text-description font-semibold text-slate-500`}>
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
