import AttendanceView from "@/src/components/Attendance/AttendanceDetails";
import { useLocalSearchParams } from "expo-router";

export default function AdminAttendanceDetails() {
  const { userId, name } = useLocalSearchParams();

  return <AttendanceView userId={userId as string} name={name as string} />;
}