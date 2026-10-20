import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";

import { COLOR_PRESETS } from "@/src/constants/adminCalendar";
import tw from "twrnc";

type Step = "choose" | "holiday" | "event";

interface Props {
  visible: boolean;
  startDate: string;
  endDate: string;
  onClose: () => void;
  onConfirm: (
    type: "holiday" | "event",
    label: string,
    color?: string,
  ) => Promise<void>;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSingleDay = startDate === endDate;
  const dateLabel = isSingleDay ? startDate : `${startDate} → ${endDate}`;

  const isPastDate = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

  const handleConfirm = async () => {
    if (!label.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      if (step === "holiday") {
        await onConfirm("holiday", label.trim());
      } else if (step === "event") {
        await onConfirm("event", label.trim(), eventColor);
      }

      Alert.alert("Success", "Added successfully 🎉");

      reset();
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent>

      {/* ✅ Backdrop lives OUTSIDE KeyboardAvoidingView — always fills full screen */}
      <Pressable
        style={[tw`absolute inset-0 bg-black/40`, { flex: 1 }]}
        onPress={handleClose}
      />
      <KeyboardAvoidingView
        style={[tw`flex-1 justify-end`, { pointerEvents: "box-none" }]}          // ← pushes sheet to bottom
        behavior={Platform.OS === "ios" ? "padding" : undefined}  // ← no "height" on Android
      >

        <View style={tw`bg-white rounded-t-3xl px-6 pt-4 pb-10`}>
          <View style={tw`w-10 h-1 bg-slate-300 rounded-full self-center mb-5`} />
          <Text style={tw`text-sm font-semibold text-slate-400 mb-1`}>
            {dateLabel}
          </Text>

          {/* STEP 1 */}
          {step === "choose" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-6`}>
                What do you want to add?
              </Text>

              <View style={tw`flex-row gap-3`}>
                <Pressable
                  onPress={() => !isPastDate && setStep("holiday")}
                  disabled={isPastDate || isSubmitting}
                  style={tw`flex-1 py-3 rounded-2xl bg-red-50 items-center ${isPastDate || isSubmitting ? "opacity-40" : ""
                    }`}>
                  <Text style={tw`text-sm font-bold text-red-500`}>
                    Holiday
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => !isPastDate && setStep("event")}
                  disabled={isPastDate || isSubmitting}
                  style={tw`flex-1 py-3 rounded-2xl bg-blue-50 items-center ${isPastDate || isSubmitting ? "opacity-40" : ""
                    }`}>
                  <Text style={tw`text-sm font-bold text-blue-500`}>Event</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleClose}
                disabled={isSubmitting}
                style={tw`mt-4 py-3 rounded-xl items-center bg-slate-100`}>
                <Text style={tw`text-sm font-semibold text-slate-500`}>
                  Cancel
                </Text>
              </Pressable>
            </>
          )}

          {/* HOLIDAY */}
          {step === "holiday" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-4`}>
                Holiday Name
              </Text>

              <TextInput
                autoFocus
                style={tw`border border-slate-200 rounded-xl px-4 py-3 mb-5`}
                placeholder="e.g. Dashain"
                value={label}
                onChangeText={setLabel}
                onSubmitEditing={handleConfirm}
              />

              <Pressable
                onPress={handleConfirm}
                disabled={isSubmitting}
                style={tw`py-3 rounded-xl bg-red-500 items-center`}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white font-semibold`}>Add Holiday</Text>
                )}
              </Pressable>
            </>
          )}

          {/* EVENT */}
          {step === "event" && (
            <>
              <Text style={tw`text-lg font-bold text-slate-800 mb-4`}>
                Event Name
              </Text>

              <TextInput
                autoFocus
                style={tw`border border-slate-200 rounded-xl px-4 py-3 mb-4`}
                placeholder="e.g. Meeting"
                value={label}
                onChangeText={setLabel}
                onSubmitEditing={handleConfirm}
              />

              <View style={tw`flex-row flex-wrap gap-2 mb-5`}>
                {COLOR_PRESETS.map((c) => (
                  <Pressable
                    key={c}
                    onPress={() => setEventColor(c)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: c,
                      borderWidth: eventColor === c ? 2 : 0,
                    }}
                  />
                ))}
              </View>

              <Pressable
                onPress={handleConfirm}
                disabled={isSubmitting}
                style={[
                  tw`py-3 rounded-xl items-center`,
                  { backgroundColor: eventColor },
                ]}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={tw`text-white font-semibold`}>Add Event</Text>
                )}
              </Pressable>
            </>
          )}
        </View>
      </KeyboardAvoidingView >
    </Modal >
  );
}
