import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { FlatList, Pressable, Text, View } from "react-native";

import Capsule from "@/src/components/Capsule";
import SummaryBox from "@/src/components/SummaryBox";
import { useAttendance } from "@/src/hooks/useAttendance";
import { TW } from "@/theme/twStyles";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import tw from "twrnc";

type Props = {
  userId: string;
  name: string;
};

const AttendanceView: React.FC<Props> = ({ userId, name }) => {
  const {
    summary,
    months,
    groupedByDate,
    selectedMonth,
    setSelectedMonth,
    expandedDayId,
    setExpandedDayId,
  } = useAttendance(userId);

  const [showMonthPicker, setShowMonthPicker] = React.useState(false);

  const renderItem = (day: string, records: any[]) => {
    const isExpanded = expandedDayId === day;

    return (
      <View
        key={day}
        style={tw`bg-white rounded-2xl p-4 mb-3 border ${TW.BORDER}`}
      >
        <Pressable onPress={() => setExpandedDayId(isExpanded ? null : day)}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`font-semibold text-base ${TW.textPrimary}`}>
              {day}
            </Text>

            <View style={tw`flex-row`}>
              {records.map((r) => (
                <Capsule
                  key={r.id}
                  text={r.status ?? "unknown"}
                  color={
                    r.status === "present"
                      ? "green"
                      : r.status === "absent"
                        ? "red"
                        : r.status === "on_leave"
                          ? "yellow"
                          : "orange"
                  }
                />
              ))}
            </View>
          </View>
        </Pressable>

        {isExpanded && (
          <View style={tw`mt-3 pt-3 border-t ${TW.BORDER}`}>
            {records.map((r) => (
              <View
                key={r.id}
                style={tw`flex-row justify-between mb-1`}
              >
                <Text style={tw`${TW.textSecondary}`}>
                  Check In
                </Text>

                <Text style={tw`font-medium ${TW.textPrimary}`}>
                  {formatTime(r.check_in_time)}
                </Text>

                <Text style={tw`${TW.textSecondary}`}>
                  Check Out
                </Text>

                <Text style={tw`font-medium ${TW.textPrimary}`}>
                  {formatTime(r.check_out_time)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={tw`flex-1 ${TW.bgPrimary} p-4`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-5`}>
        <View>
          <Text style={tw`text-xl font-bold ${TW.textPrimary}`}>
            {name}
          </Text>
          <Text style={tw`${TW.textSecondary}`}>
            {selectedMonth ?? getMonthKey(getTodayDate())}
          </Text>
        </View>
        <Pressable
          onPress={() => setShowMonthPicker(!showMonthPicker)}
          style={tw`bg-white p-2 rounded-xl border ${TW.BORDER}`}
        >
          <Ionicons name="calendar-outline" size={22} color="#1B4A5A" />
        </Pressable>
      </View>
      {/* Month Picker */}
      {showMonthPicker && (
        <View style={tw`flex-row flex-wrap mb-4`}>
          {months.map((month) => (
            <Pressable
              key={month}
              onPress={() => {
                setSelectedMonth(month);
                setShowMonthPicker(false);
              }}
              style={tw`px-4 py-2 mr-2 mb-2 rounded-xl border ${selectedMonth === month
                ? "bg-[#E6F1F3] border-[#1B4A5A]"
                : "bg-white border-slate-200"
                }`}
            >
              <Text
                style={tw`text-sm ${selectedMonth === month
                  ? "text-[#1B4A5A] font-semibold"
                  : "text-gray-600"
                  }`}
              >
                {month}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {/* Summary */}
      <View style={tw`flex-row justify-between mb-4`}>
        <SummaryBox label="Present" value={summary.present} color="green" />
        <SummaryBox label="Leave" value={summary.leave} color="yellow" />
        <SummaryBox label="Absent" value={summary.absent} color="red" />
      </View>
      {/* Attendance List */}
      <FlatList
        data={Object.entries(groupedByDate)}
        keyExtractor={([day]) => day}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => renderItem(item[0], item[1])}
      />
    </View>
  );
};

export default AttendanceView;