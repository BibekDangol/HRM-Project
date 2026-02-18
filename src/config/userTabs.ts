import { LayoutDashboard, MoreHorizontal, Users } from "lucide-react-native";

export const userTabs = [
  {
    name: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "leaves",        // ✅ was "leaves/index"
    title: "Leaves",
    icon: Users,
  },
  {
    name: "profile/index",
    title: "Profile",
    icon: Users,
  },
  {
    name: "more",
    title: "Setting",
    icon: MoreHorizontal,
  },
] as const;

export type UserTabName = (typeof userTabs)[number]["name"];