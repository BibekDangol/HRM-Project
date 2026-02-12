import {
  CalendarDays,
  Home,
  MoreHorizontal,
  Users,
} from "lucide-react-native";

export const adminTabs = [
  {
    name: "dashboard",
    title: "Dashboard",
    icon: Home,
  },
  {
    name: "manage-users",
    title: "Manage Users",
    icon: Users,
  },
  {
    name: "leave",
    title: "Leave Requests",
    icon: CalendarDays,
  },
  {
    name: "more",
    title: "More",
    icon: MoreHorizontal,
  },
] as const;
export type AdminTabName = (typeof adminTabs)[number]["name"];
