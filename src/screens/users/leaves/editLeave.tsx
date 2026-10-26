import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LeaveCalendarModal } from "@/src/components/userLeave/LeaveCalendarModal";
import { LeaveFormFields } from "@/src/components/userLeave/LeaveFormFields";
import LoadingState from "@/src/components/states/LoadingState";
import React from "react";
import { TW } from "@/theme/twStyles";
import { firstParam } from "@/src/utils/leaveUtils";
import tw from "twrnc";
import { useLeaveForm } from "@/src/hooks/users/useLeaveForm";
import { useLocalSearchParams, useRouter } from "expo-router";

const SPACING = {
  screenX: 20,
  top: 10,
  buttonY: 13,
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
    <View style={tw`flex-1 bg-white`}>
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

        <View style={tw`mt-4 flex-row gap-3`}>
          <Pressable
            disabled={submitting}
            onPress={goBackToLeaves}
            style={({ pressed }) => ({
              flex: 1,
              borderWidth: 1.5,
              borderColor: "#CBD5E1",
              borderRadius: 10,
              paddingVertical: SPACING.buttonY,
              alignItems: "center",
              backgroundColor: "#ffffff",
              opacity: pressed || submitting ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: "#64748B",
              }}
            >
              Cancel
            </Text>
          </Pressable>

          <Pressable
            disabled={submitting}
            onPress={handleSubmitPress}
            style={({ pressed }) => ({
              flex: 1,
              backgroundColor: TW.bgSecondary,
              borderRadius: 10,
              paddingVertical: SPACING.buttonY,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: submitting ? 0.55 : pressed ? 0.8 : 1,
            })}
          >
            {submitting && <ActivityIndicator size="small" color="#ffffff" />}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: "#ffffff",
              }}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Text>
          </Pressable>
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
