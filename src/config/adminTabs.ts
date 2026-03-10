import { CalendarDays, Home, Menu, Users } from "lucide-react-native";

export const adminTabs = [
  {
    name: "dashboard",
    title: "Home",
    icon: Home,
  },
  {
    name: "manage-users",
    title: "Users",
    icon: Users,
  },
  {
    name: "leave",
    title: "Leaves",
    icon: CalendarDays,
  },
  {
    name: "more",
    title: "More",
    icon: Menu,
  },
] as const;
export type AdminTabName = (typeof adminTabs)[number]["name"];
