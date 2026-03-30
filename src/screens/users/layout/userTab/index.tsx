import { AttendanceProvider } from "@/src/context/AttendanceContext";
import LayoutInner from "./components/LayoutInner";

export default function UsersTabsLayout() {
  return (
    <AttendanceProvider>
      <LayoutInner />
    </AttendanceProvider>
  );
}
