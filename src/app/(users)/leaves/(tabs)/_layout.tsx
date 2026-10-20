import { createMaterialTopTabNavigator } from "expo-router/js-top-tabs";
import { withLayoutContext } from "expo-router";

const TopTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

export default function LeavesTabsLayout() {
  return (
    <TopTabs
      screenOptions={{
        tabBarStyle: { display: "none" },
      }}
    >
      <TopTabs.Screen name="index" />
    </TopTabs>
  );
}
