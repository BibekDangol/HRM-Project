import {
  CalendarDays,
  House,
  HouseIcon,
  Menu,
} from "lucide-react-native";

export const userTabs = [
  {
    name: "dashboard",
    title: "Home",
    icon: House,
    activeIcon: HouseIcon,
  },
  {
    name: "leaves",
    title: "Leaves",
    icon: CalendarDays,
  },
  {
    name: "more",
    title: "More",
    icon: Menu,
  },
] as const;