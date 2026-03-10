import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
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
  const dateLabel = isSingleDay ? startDate : `${startDate} → ${endDate}`;

  // ── Past-date guard ──────────────────────────────────────────────
  const isPastDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // strip time so today itself is allowed
    const selected = new Date(startDate);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
  })();

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
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <Pressable
          style={tw`flex-1 bg-black/40`}
          onPress={handleClose}
          android_ripple={null}
        />

        <View style={tw`bg-white rounded-t-3xl px-6 pt-4 pb-10`}>
          {/* Handle bar */}
          <View
            style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-5`}
          />

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
                {/* ── Holiday button (disabled for past dates) ── */}
                <Pressable
                  onPress={() => !isPastDate && setStep("holiday")}
                  style={({ pressed }) =>
                    tw`flex-1 py-3 rounded-2xl bg-red-50 items-center${
                      isPastDate ? " opacity-40" : pressed ? " opacity-70" : ""
                    }`
                  }
                  android_ripple={
                    isPastDate ? null : { color: "#fca5a5", borderless: false }
                  }
                >
                  <Text style={tw`text-sm font-bold text-red-500`}>
                    Holiday
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => !isPastDate && setStep("event")}
                  style={({ pressed }) =>
                    tw`flex-1 py-3 rounded-2xl bg-blue-50 items-center${
                      isPastDate ? " opacity-40" : pressed ? " opacity-70" : ""
                    }`
                  }
                  android_ripple={
                    isPastDate ? null : { color: "#bfdbfe", borderless: false }
                  }
                >
                  <Text style={tw`text-sm font-bold text-blue-500`}>Event</Text>
                </Pressable>
              </View>

              {isPastDate && (
                <Text style={tw`text-xs text-gray-700 mt-2 text-center`}>
                  Holidays and Events cannot be added to past dates.
                </Text>
              )}

              <Pressable
                onPress={handleClose}
                style={({ pressed }) =>
                  tw`mt-4 py-3 rounded-xl items-center bg-slate-100${pressed ? " opacity-70" : ""}`
                }
                android_ripple={{ color: "#e2e8f0", borderless: false }}
              >
                <Text style={tw`text-sm font-semibold text-slate-500`}>
                  Cancel
                </Text>
              </Pressable>
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
                style={[
                  tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-5`,
                  Platform.OS === "android" && { paddingVertical: 10 },
                ]}
                placeholder="e.g. Dashain, New Year's Day"
                placeholderTextColor="#94a3b8"
                value={label}
                onChangeText={setLabel}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
                underlineColorAndroid="transparent"
              />

              <View style={tw`flex-row gap-3`}>
                <Pressable
                  onPress={() => setStep("choose")}
                  style={({ pressed }) =>
                    tw`flex-1 py-3 rounded-xl border border-slate-200 items-center${pressed ? " opacity-70" : ""}`
                  }
                  android_ripple={{ color: "#e2e8f0", borderless: false }}
                >
                  <Text style={tw`text-slate-600 font-medium`}>Back</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    tw`flex-1 py-3 rounded-xl items-center${pressed ? " opacity-70" : ""}`,
                    { backgroundColor: label.trim() ? "#EF4444" : "#fca5a5" },
                  ]}
                  android_ripple={{ color: "#ffffff40", borderless: false }}
                >
                  <Text style={tw`text-white font-semibold`}>Add Holiday</Text>
                </Pressable>
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
                style={[
                  tw`border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-4`,
                  Platform.OS === "android" && { paddingVertical: 10 },
                ]}
                placeholder="e.g. Team Outing, Training"
                placeholderTextColor="#94a3b8"
                value={label}
                onChangeText={setLabel}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
                underlineColorAndroid="transparent"
              />

              <Text
                style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider mb-2`}
              >
                Color
              </Text>
              <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
                {COLOR_PRESETS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setEventColor(c)}
                    style={({ pressed }) => [
                      tw`w-8 h-8 rounded-full border-2${pressed ? " opacity-70" : ""}`,
                      {
                        backgroundColor: c,
                        borderColor:
                          eventColor === c ? "#0f172a" : "transparent",
                      },
                    ]}
                    android_ripple={{ color: "#00000020", borderless: true }}
                  />
                ))}
              </View>

              <View style={tw`flex-row gap-3`}>
                <Pressable
                  onPress={() => setStep("choose")}
                  style={({ pressed }) =>
                    tw`flex-1 py-3 rounded-xl border border-slate-200 items-center${pressed ? " opacity-70" : ""}`
                  }
                  android_ripple={{ color: "#e2e8f0", borderless: false }}
                >
                  <Text style={tw`text-slate-600 font-medium`}>Back</Text>
                </Pressable>

                <Pressable
                  onPress={handleConfirm}
                  style={({ pressed }) => [
                    tw`flex-1 py-3 rounded-xl items-center${pressed ? " opacity-70" : ""}`,
                    {
                      backgroundColor: label.trim()
                        ? eventColor
                        : eventColor + "80",
                    },
                  ]}
                  android_ripple={{ color: "#ffffff40", borderless: false }}
                >
                  <Text style={tw`text-white font-semibold`}>Add Event</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
