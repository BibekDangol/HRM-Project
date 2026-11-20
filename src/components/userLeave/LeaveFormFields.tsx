import { fontSizes, inputTextMetrics, lineHeights } from "@/theme/typography";
import { colors } from "@/theme/colors";
import React from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import { Check } from "lucide-react-native";
import { DateField } from "@/src/components/userLeave/DateField";
import { LeaveTypeDropdown } from "@/src/components/userLeave/LeaveTypeDropdown";
import { FormValues, LeaveTypeWithStats } from "@/src/types/userLeave";
import { TW } from "@/theme/twStyles";
import tw from "@/theme/tw";

export type LeaveFormFieldsProps = {
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  isHalfDay: boolean;
  selectedLeaveType: number | null;
  leaveTypeError: string;
  leaveTypes: LeaveTypeWithStats[];
  loadingTypes: boolean;
  onLeaveTypeChange: (id: number | null) => void;
  onRefreshLeaveTypes: () => void;
  localStartDate: string;
  localEndDate: string;
  dateError: string;
  onOpenCalendar: (field: "start" | "end") => void;
  onHalfDayChange?: (isHalfDay: boolean) => void;
};

const SPACING = {
  section: 16,
  labelBottom: 8,
  rowGap: 10,
  inputY: 12,
  inputX: 14,
};

const ERROR_TEXT = {
  marginTop: 6,
  fontSize: fontSizes.label, lineHeight: lineHeights.label,
  color: colors.danger,
  fontWeight: "500" as const,
};

export function LeaveFormFields({
  control,
  errors,
  setValue,
  isHalfDay,
  selectedLeaveType,
  leaveTypeError,
  leaveTypes,
  loadingTypes,
  onLeaveTypeChange,
  onRefreshLeaveTypes,
  localStartDate,
  localEndDate,
  dateError,
  onOpenCalendar,
  onHalfDayChange,
}: LeaveFormFieldsProps) {
  return (
    <View style={tw`gap-4`}>
      {/* Leave Type */}
      <View style={{ marginBottom: SPACING.section }}>
        <Text
          style={[
            tw`text-label font-semibold`,
            { color: colors.ink, marginBottom: SPACING.labelBottom },
          ]}
        >
          Leave Type
        </Text>
        <LeaveTypeDropdown
          value={selectedLeaveType}
          onChange={onLeaveTypeChange}
          leaveTypes={leaveTypes}
          loading={loadingTypes}
          onRefresh={onRefreshLeaveTypes}
        />
        {!!leaveTypeError && <Text style={ERROR_TEXT}>{leaveTypeError}</Text>}
      </View>

      {/* Duration */}
      <View>
        <Text
          style={[
            tw`text-label font-semibold`,
            { color: colors.ink, marginBottom: SPACING.labelBottom },
          ]}
        >
          Duration
        </Text>
        <View style={{ flexDirection: "row", gap: SPACING.rowGap }}>
          <View style={tw`flex-1`}>
            <DateField
              label="Start Date"
              value={localStartDate || "Select start date"}
              onPress={() => onOpenCalendar("start")}
            />
          </View>
          {!isHalfDay && (
            <View style={tw`flex-1`}>
              <DateField
                label="End Date"
                value={localEndDate || "Select end date"}
                onPress={() => onOpenCalendar("end")}
              />
            </View>
          )}
        </View>
        {!!dateError && <Text style={ERROR_TEXT}>{dateError}</Text>}
      </View>

      {/* Day Option */}
      <View style={{ marginBottom: SPACING.section }}>
        <Text
          style={[
            tw`text-label font-semibold`,
            { color: colors.ink, marginBottom: SPACING.labelBottom },
          ]}
        >
          Day Option
        </Text>
        <Controller
          control={control}
          name="isHalfDay"
          render={({ field: { value, onChange } }) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel="Half day"
              accessibilityState={{ checked: value }}
              aria-checked={value}
              onPress={() => {
                const next = !value;
                onChange(next);
                onHalfDayChange?.(next);
                if (next && localStartDate) {
                  setValue("halfSession", "first_shift", {
                    shouldValidate: true,
                  });
                }
              }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                alignSelf: "flex-start",
                minHeight: 48,
                paddingHorizontal: 4,
                opacity: pressed ? 0.85 : 1,
                marginBottom: value ? 14 : 0,
              })}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderWidth: 2,
                  borderRadius: 5,
                  borderColor: value ? TW.bgSecondary : colors.borderStrong,
                  backgroundColor: value ? TW.bgSecondary : colors.surface,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {value ? (
                  <Check color={colors.surface} size={12} strokeWidth={3} />
                ) : null}
              </View>
              <Text
                style={{
                  fontSize: fontSizes.label, lineHeight: lineHeights.label,
                  fontWeight: "600",
                  color: colors.ink,
                }}
              >
                Half Day
              </Text>
            </Pressable>
          )}
        />

        {isHalfDay && (
          <View>
            <Text
              style={[
                tw`text-label font-semibold`,
                {
                  color: colors.ink,
                  marginBottom: SPACING.labelBottom,
                },
              ]}
            >
              Session
            </Text>
            <Controller
              control={control}
              name="halfSession"
              render={({ field: { value, onChange } }) => (
                <View style={tw`flex-row gap-2.5`}>
                  {(["first_shift", "second_shift"] as const).map((session) => (
                    <Pressable
                      key={session}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: value === session }}
                      aria-checked={value === session}
                      onPress={() => onChange(session)}
                      style={({ pressed }) => ({
                        flex: 1,
                        paddingVertical: 13,
                        borderWidth: 1.5,
                        borderRadius: 10,
                        borderColor:
                          value === session ? TW.bgSecondary : colors.border,
                        backgroundColor:
                          value === session ? TW.bgSecondary : colors.surface,
                        alignItems: "center",
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <Text
                        style={{
                          fontSize: fontSizes.label, lineHeight: lineHeights.label,
                          fontWeight: "500",
                          color: value === session ? colors.surface : TW.bgSecondary,
                        }}
                      >
                        {session === "first_shift" ? "First Half" : "Second Half"}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* Reason / Description */}
      <View style={{ marginBottom: SPACING.section }}>
        <Text
          style={[
            tw`text-label font-semibold`,
            { color: colors.ink, marginBottom: SPACING.labelBottom },
          ]}
        >
          Reason / Description
        </Text>
        <Controller
          control={control}
          name="reason"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Enter reason for leave..."
              accessibilityLabel="Reason for leave"
              placeholderTextColor={colors.placeholder}
              multiline
              textAlignVertical="top"
              style={{
                paddingHorizontal: SPACING.inputX,
                paddingVertical: SPACING.inputY,
                borderWidth: 1.5,
                borderRadius: 10,
                borderColor: errors.reason ? colors.danger : colors.border,
                color: colors.ink,
                fontSize: fontSizes.label,
                ...inputTextMetrics,
                minHeight: 90,
                backgroundColor: colors.surface,
              }}
            />
          )}
        />
        {!!errors.reason?.message && (
          <Text style={ERROR_TEXT}>{errors.reason.message}</Text>
        )}
      </View>
    </View>
  );
}

export default LeaveFormFields;
