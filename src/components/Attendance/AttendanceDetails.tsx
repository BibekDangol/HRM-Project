import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { FlatList, Pressable, Text, View } from "react-native";

import Capsule from "@/src/components/Capsule";
import SummaryBox from "@/src/components/SummaryBox";
import { useAttendance } from "@/src/hooks/useAttendance";
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
      <View key={day} style={tw`bg-white rounded-xl p-4 mb-3 shadow`}>
        <Pressable onPress={() => setExpandedDayId(isExpanded ? null : day)}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`font-semibold text-gray-900 text-lg`}>
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
          <View style={tw`mt-2`}>
            {records.map((r) => (
              <Text key={r.id} style={tw`text-gray-500`}>
                {formatTime(r.check_in_time)} →{" "}
                {formatTime(r.check_out_time)} ({r.status})
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View>
          <Text style={tw`text-2xl font-bold text-gray-900`}>
            {name}
          </Text>
          <Text style={tw`text-gray-500`}>
            {selectedMonth ?? getMonthKey(getTodayDate())}
          </Text>
        </View>

        <Pressable onPress={() => setShowMonthPicker(!showMonthPicker)}>
          <Ionicons name="calendar-outline" size={26} />
        </Pressable>
      </View>

      {/* Month Picker */}
      {showMonthPicker && (
        <View style={tw`flex-row flex-wrap mb-4`}>
          {months.map((month) => (
            <Pressable
              key={month}
              onPress={() => setSelectedMonth(month)}
              style={tw`px-3 py-2 mr-2 mb-2 rounded-xl ${selectedMonth === month ? "bg-green-200" : "bg-white"
                }`}
            >
              <Text>{month}</Text>
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

      {/* List */}
      <FlatList
        data={Object.entries(groupedByDate)}
        keyExtractor={([day]) => day}
        renderItem={({ item }) => renderItem(item[0], item[1])}
      />
    </View>
  );
};

export default AttendanceView;