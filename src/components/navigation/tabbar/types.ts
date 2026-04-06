import { LucideIcon } from "lucide-react-native";

export type TabBarItemConfig = {
  name: string;
  title: string;
  icon: LucideIcon;
  activeIcon?: LucideIcon;
};

export type BaseTabBarMode = "simple" | "pill";