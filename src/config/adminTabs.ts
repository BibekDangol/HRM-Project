import {
  CalendarDays,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from "lucide-react-native";

export const adminTabs = [
  {
    name: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "manage-users",
    title: "Manage Users",
    icon: Users,
  },
  {
    name: "leaves",
    title: "Leave Requests",
    icon: CalendarDays,
  },
  {
    name: "more",
    title: "More",
    icon: MoreHorizontal,
  },
];
