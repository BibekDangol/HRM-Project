import AttendanceView from "@/src/components/Attendance/AttendanceDetails";
import { useLocalSearchParams } from "expo-router";

export default function UserAttendanceDetails() {
  const { userId, name } = useLocalSearchParams<{
    userId: string,
    name: string,
  }>();
  return (
    <AttendanceView
      userId={userId}
      name={name}
    />
  );
}