import { formatTime, getMonthKey, getTodayDate } from "@/src/utils/getDate";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import Capsule from "@/src/components/Capsule";
import SummaryBox from "@/src/components/SummaryBox";
import { supabase } from "@/src/supabase/supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";

export type Attendance = {
  check_in_time: string | null;
  check_out_time: string | null;
  id: string;
  status: string | null;
};
const UserAttendanceDetails = () => {
  const router = useRouter();
  console.log(router.canGoBack());
  const { userId, name } = useLocalSearchParams<{
    userId: string;
    name: string;
  }>();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const fetchAttendance = async () => {
    setAttendance([]);
    const { data, error } = await supabase
      .from("attendance")
      .select("id, check_in_time, check_out_time, status")
      .eq("user_id", userId);
    if (error) {
      console.log("Admin fetching attendance", error);
      return [];
    }
    setAttendance(data as Attendance[]);
  };
  useEffect(() => {
    if (!userId) return;
    fetchAttendance();
  }, [userId]);

  const summary = {
    present: attendance.filter((u) => u.status === "present").length,
    leave: attendance.filter((u) => u.status === "on_leave").length,
    absent: attendance.filter((u) => u.status === "absent").length,
  };
  // get unique months from attendance for picking months
  const months = Array.from(
    new Set(
      attendance
        .filter((a) => a.check_in_time)
        .map((a) => getMonthKey(a.check_in_time!)),
    ),
  );
  //monthdata
  const monthData = selectedMonth
    ? attendance.filter(
      (a) =>
        a.check_in_time && getMonthKey(a.check_in_time) === selectedMonth,
    )
    : attendance;

  // Group attendance by date
  const groupedByDate = monthData.reduce(
    (acc: Record<string, Attendance[]>, att) => {
      if (att.check_in_time) {
        const date = att.check_in_time.split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(att);
      }
      return acc;
    },
    {},
  );

  const renderItem = (day: string, records: Attendance[]) => {
    const isExpanded = expandedDayId === day;
    return (
      <View key={day} style={tw`bg-white rounded-xl p-4 mb-3 shadow`}>
        <Pressable onPress={() => setExpandedDayId(isExpanded ? null : day)}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`font-semibold text-gray-900 text-lg`}>{day}</Text>
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
                {formatTime(r.check_in_time)} → {formatTime(r.check_out_time)} (
                {r.status})
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };
  return (
    <>
      <View style={tw`flex-1 bg-gray-100 p-4`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <View>
            <Text style={tw`text-2xl font-bold text-gray-900`}>{name}</Text>
            <Text style={tw`text-gray-500`}>
              {selectedMonth ?? getMonthKey(getTodayDate())}
            </Text>
          </View>
          {/* calendar icon */}
          <Pressable onPress={() => setShowMonthPicker(!showMonthPicker)}>
            <Ionicons name="calendar-outline" size={26} />
          </Pressable>
        </View>
        {/* Month picker Modal */}
        {showMonthPicker && (
          <View style={tw`flex-row flex-wrap mb-4`}>
            {months.map((month) => (
              <Pressable
                key={month}
                onPress={() => {
                  setSelectedMonth(month);
                  setExpandedDayId(null);
                }}
                style={tw`px-3 py-2 mr-2 mb-2 rounded-xl ${selectedMonth === month ? "bg-green-200" : "bg-white"}`}
              >
                <Text style={tw`text-gray-900`}>{month}</Text>
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
          renderItem={({ item }) => renderItem(item[0], item[1])}
        />

        {/* Default → Today
      {!selectedDay && (
        <FlatList
          data={todaysAttendance}
          keyExtractor={i => i.id}
          renderItem={renderItem}
        />
      )}
      {/* Month view */}
        {/* {selectedDay && (
        <FlatList
          data={monthData}
          keyExtractor={i => i.id}
          renderItem={({ item }) => <DayAttendance item={item} />}
        />
      )} */}
      </View>
    </>
  );
};
export default UserAttendanceDetails;
