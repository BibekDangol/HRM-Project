import AppButton from "@/src/components/ui/AppButton";
import { LeaveRequestSummary } from "@/src/components/userLeave/LeaveRequestSummary";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LeaveCalendarModal } from "@/src/components/userLeave/LeaveCalendarModal";
import { LeaveFormFields } from "@/src/components/userLeave/LeaveFormFields";
import React from "react";
import tw from "@/theme/tw";
import { useLeaveForm } from "@/src/hooks/users/useLeaveForm";
import { useRouter } from "expo-router";

const SPACING = {
  screenX: 16,
  top: 18,
};

export default function ApplyLeaveScreen() {
  const router = useRouter();

  const {
    control,
    errors,
    setValue,
    isHalfDay,
    selectedLeaveType,
    leaveTypeError,
    leaveTypes,
    loadingTypes,
    localStartDate,
    localEndDate,
    dateError,
    submitting,
    computedDaysCount,
    selectedType,
    calendarVisible,
    calYear,
    calMonth,
    markedDates,
    todayStr,
    setCalYear,
    setCalMonth,
    handleLeaveTypeChange,
    handleHalfDayChange,
    loadLeaveTypesWithStats,
    openCalendar,
    closeCalendar,
    onDayPress,
    handleSubmitPress,
  } = useLeaveForm({
    onSuccess: () => {
      router.back();
    },
  });

  return (
    <View style={tw`flex-1 bg-canvas`}>
      <KeyboardAwareScrollView
        enableOnAndroid
        extraScrollHeight={24}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableAutomaticScroll
        contentContainerStyle={{
          paddingHorizontal: SPACING.screenX,
          paddingTop: SPACING.top,
          flexGrow: 1,
          gap: 18,
          paddingBottom: 24,
        }}
      >
        <View>
          <Text style={tw`text-page font-bold text-ink`}>
            New Leave Request
          </Text>
          <Text style={tw`mt-1.5 text-description text-muted`}>
            Fill in the details to submit a leave request
          </Text>
        </View>

        <LeaveFormFields
          control={control}
          errors={errors}
          setValue={setValue}
          isHalfDay={isHalfDay}
          selectedLeaveType={selectedLeaveType}
          leaveTypeError={leaveTypeError}
          leaveTypes={leaveTypes}
          loadingTypes={loadingTypes}
          onLeaveTypeChange={handleLeaveTypeChange}
          onRefreshLeaveTypes={loadLeaveTypesWithStats}
          localStartDate={localStartDate}
          localEndDate={localEndDate}
          dateError={dateError}
          onOpenCalendar={openCalendar}
          onHalfDayChange={handleHalfDayChange}
        />

        <LeaveRequestSummary
          days={computedDaysCount}
          leaveType={selectedType}
          loading={loadingTypes}
        />

        <View style={tw`mt-2 flex-row flex-wrap gap-3`}>
          <AppButton
            title="Cancel"
            variant="secondary"
            disabled={submitting}
            onPress={() => router.back()}
            style={{ flexGrow: 1, flexBasis: 140 }}
          />
          <AppButton
            title="Submit request"
            loadingTitle="Submitting…"
            loading={submitting}
            onPress={handleSubmitPress}
            style={{ flexGrow: 1, flexBasis: 140 }}
          />
        </View>
      </KeyboardAwareScrollView>

      <LeaveCalendarModal
        visible={calendarVisible}
        calYear={calYear}
        calMonth={calMonth}
        markedDates={markedDates}
        minDate={todayStr}
        onClose={closeCalendar}
        onDayPress={onDayPress}
        onMonthChange={(m) => {
          setCalYear(m.year);
          setCalMonth(m.month);
        }}
      />
    </View>
  );
}
