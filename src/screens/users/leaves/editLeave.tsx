import AppButton from "@/src/components/ui/AppButton";
import { LeaveRequestSummary } from "@/src/components/userLeave/LeaveRequestSummary";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LeaveCalendarModal } from "@/src/components/userLeave/LeaveCalendarModal";
import { LeaveFormFields } from "@/src/components/userLeave/LeaveFormFields";
import LoadingState from "@/src/components/states/LoadingState";
import React from "react";
import { TW } from "@/theme/twStyles";
import { firstParam } from "@/src/utils/leaveUtils";
import tw from "@/theme/tw";
import { useLeaveForm } from "@/src/hooks/users/useLeaveForm";
import { useLocalSearchParams, useRouter } from "expo-router";

const SPACING = {
  screenX: 20,
  top: 10,
};

export default function EditLeaveScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    leaveId?: string | string[];
    returnTab?: string | string[];
  }>();

  const leaveId = firstParam(params.leaveId);
  const returnTab = firstParam(params.returnTab) || "pending";

  const goBackToLeaves = () => {
    router.replace({
      pathname: "/(users)/leaves/(tabs)",
      params: { tab: returnTab },
    });
  };

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
    screenLoading,
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
    leaveId,
    onSuccess: goBackToLeaves,
  });

  if (screenLoading) {
    return <LoadingState fullScreen message="Loading leave details..." />;
  }

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
          paddingBottom: 36,
          gap: 16,
        }}
      >
        <View style={tw`mb-2`}>
          <Text style={[tw`text-2xl font-bold`, { color: TW.bgSecondary }]}>
            Edit Leave Request
          </Text>
          <Text style={tw`mt-1.5 text-[13px] text-slate-400`}>
            Update the details of your pending leave
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
            onPress={goBackToLeaves}
            style={{ flexGrow: 1, flexBasis: 140 }}
          />
          <AppButton
            title="Save changes"
            loadingTitle="Saving…"
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
