import { LayoutDashboard, MoreHorizontal, Users } from "lucide-react-native";

export const userTabs = [
  {
    name: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "leaves/index",
    title: "Leaves",
    icon: Users,
  },
  {
    name: "more",
    title: "More",
    icon: MoreHorizontal,
  },
] as const;
export type AdminTabName = (typeof userTabs)[number]["name"];
