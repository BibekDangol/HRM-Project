import { MAX_YEAR, MIN_YEAR, MONTHS } from "@/src/utils/userDashboard";
import { Modal, Pressable, Text, View } from "react-native";

import React from "react";

type Props = {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number;

  setSelectedYear: (y: number) => void;
  setSelectedMonth: (m: number) => void;

  onClose: () => void;
};

export function MonthPickerModal({
  visible,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
  onClose,
}: Props) {
  const canIncYear = selectedYear < MAX_YEAR;
  const canDecYear = selectedYear > MIN_YEAR;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
        onPress={onClose}>
        <Pressable
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 16,
          }}
          onPress={() => {}}>
          {/* YEAR */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 20,
              marginBottom: 20,
            }}>
            <Pressable
              disabled={!canDecYear}
              onPress={() => setSelectedYear(selectedYear - 1)}>
              <Text>{"<"}</Text>
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {selectedYear}
            </Text>

            <Pressable
              disabled={!canIncYear}
              onPress={() => setSelectedYear(selectedYear + 1)}>
              <Text>{">"}</Text>
            </Pressable>
          </View>

          {/* MONTH GRID */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}>
            {MONTHS.map((m, idx) => (
              <Pressable
                key={m}
                onPress={() => {
                  setSelectedMonth(idx);
                  onClose();
                }}
                style={{
                  width: "30%",
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor:
                    idx === selectedMonth ? "#008080" : "#F3F4F6",
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    color: idx === selectedMonth ? "white" : "#111827",
                  }}>
                  {m}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* CLOSE */}
          <Pressable
            onPress={onClose}
            style={{
              marginTop: 20,
              padding: 14,
              backgroundColor: "#FFC107",
              borderRadius: 20,
              alignItems: "center",
            }}>
            <Text style={{ fontWeight: "700" }}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
