import AttendanceView from "@/src/components/Attendance/AttendanceDetails";
import { useLocalSearchParams } from "expo-router";

export default function AdminAttendanceDetails() {
  const params = useLocalSearchParams<{ userId: string; name: string }>();

  return <AttendanceView userId={params.userId} name={params.name} />;
}