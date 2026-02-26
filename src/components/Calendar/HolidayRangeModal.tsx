// components/Calendar/HolidayRangeModal.tsx

import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import tw from "twrnc";
import { COLOR_PRESETS } from "@/src/constants/adminCalendar";

type Step = "choose" | "holiday" | "event";

interface Props {
  visible: boolean;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onConfirm: (type: "holiday" | "event", label: string, color?: string) => void;
}

export function HolidayRangeModal({
  visible,
  startDate,
  endDate,
  onClose,
  onConfirm,
}: Props) {
  const [step, setStep] = useState<Step>("choose");
  const [label, setLabel] = useState("");
  const [eventColor, setEventColor] = useState("#3B82F6");

  const isSingleDay = startDate === endDate;
  const dateLabel = isSingleDay
    ? startDate
    : `${startDate} → ${endDate}`;

  const reset = () => {
    setStep("choose");
    setLabel("");
    setEventColor("#3B82F6");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    if (!label.trim()) return;
    if (step === "holiday") {
      onConfirm("holiday", label.trim());
    } else if (step === "event") {
      onConfirm("event", label.trim(), eventColor);
    }
    reset();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={tw`flex-1 bg-black/40`} onPress={handleClose} />

        <View style={tw`bg-white rounded-t-3xl px-6 pt-4 pb-10`}>
          {/* Handle bar */}
          <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-5`} />

          {/* Date label */}
          <Text style={tw`text-xs font-semibold text-slate-400 mb-1`}>
            {dateLabel}
          </Text>

          {/* ── Step 1: Choose type ── */}
          {step === "choose" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-6`}>
                What do you want to add?
              </Text>

              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setStep("holiday")}
                  style={tw`flex-1 py-5 rounded-2xl bg-red-50 items-center gap-1`}
                >
                  <Text style={tw`text-2xl`}>🎉</Text>
                  <Text style={tw`text-sm font-bold text-red-500`}>Holiday</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setStep("event")}
                  style={tw`flex-1 py-5 rounded-2xl bg-blue-50 items-center gap-1`}
                >
                  <Text style={tw`text-2xl`}>📌</Text>
                  <Text style={tw`text-sm font-bold text-blue-500`}>Event</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleClose}
                style={tw`mt-4 py-3 rounded-xl items-center bg-slate-100`}
              >
                <Text style={tw`text-sm font-semibold text-slate-500`}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2a: Holiday name ── */}
          {step === "holiday" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-4`}>
                Holiday Name
              </Text>

              <TextInput
                autoFocus
                style={tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-5`}
                placeholder="e.g. Dashain, New Year's Day"
                placeholderTextColor="#94a3b8"
                value={label}
                onChangeText={setLabel}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />

              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setStep("choose")}
                  style={tw`flex-1 py-3 rounded-xl border border-slate-200 items-center`}
                >
                  <Text style={tw`text-slate-600 font-medium`}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[
                    tw`flex-1 py-3 rounded-xl items-center`,
                    { backgroundColor: label.trim() ? "#EF4444" : "#fca5a5" },
                  ]}
                >
                  <Text style={tw`text-white font-semibold`}>Add Holiday</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* ── Step 2b: Event name + color ── */}
          {step === "event" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-4`}>
                Event Name
              </Text>

              <TextInput
                autoFocus
                style={tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-4`}
                placeholder="e.g. Team Outing, Training"
                placeholderTextColor="#94a3b8"
                value={label}
                onChangeText={setLabel}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />

              <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}>
                Colour
              </Text>
              <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
                {COLOR_PRESETS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setEventColor(c)}
                    style={[
                      tw`w-8 h-8 rounded-full border-2`,
                      {
                        backgroundColor: c,
                        borderColor: eventColor === c ? "#0f172a" : "transparent",
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={tw`flex-row gap-3`}>
                <TouchableOpacity
                  onPress={() => setStep("choose")}
                  style={tw`flex-1 py-3 rounded-xl border border-slate-200 items-center`}
                >
                  <Text style={tw`text-slate-600 font-medium`}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  style={[
                    tw`flex-1 py-3 rounded-xl items-center`,
                    { backgroundColor: label.trim() ? eventColor : eventColor + "80" },
                  ]}
                >
                  <Text style={tw`text-white font-semibold`}>Add Event</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}