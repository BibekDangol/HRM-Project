import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";

const TopTabs = withLayoutContext(
  createMaterialTopTabNavigator().Navigator
);

export default function LeavesTabsLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarActiveTintColor: "#1F7A4D",
        tabBarInactiveTintColor: "#6B7280",
        tabBarIndicatorStyle: { backgroundColor: "#1F7A4D" },
        tabBarStyle: { backgroundColor: "#ffffff" },
        tabBarLabelStyle: { fontWeight: "600", fontSize: 13 },
      }}
    >
      <TopTabs.Screen name="index" options={{ title: "Details" }} />
      <TopTabs.Screen name="requests" options={{ title: "Requests" }} />
    </TopTabs>
  );
}
