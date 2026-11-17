import { colors } from "@/theme/colors";
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs
      tintColor={colors.primary}
      indicatorColor={colors.primarySoft}
      labelVisibilityMode="labeled"
      backBehavior="initialRoute"
      unstable_nativeProps={{ nativeContainerStyle: { backgroundColor: colors.canvas } }}
    >
      <NativeTabs.Trigger name="dashboard" contentStyle={{ backgroundColor: colors.canvas }}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="manage-users" contentStyle={{ backgroundColor: colors.canvas }}>
        <NativeTabs.Trigger.Label>Users</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} md="group" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leave" contentStyle={{ backgroundColor: colors.canvas }}>
        <NativeTabs.Trigger.Label>Leaves</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "calendar", selected: "calendar" }} md="calendar_month" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="more" contentStyle={{ backgroundColor: colors.canvas }}>
        <NativeTabs.Trigger.Label>More</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "line.3.horizontal", selected: "line.3.horizontal" }} md="menu" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
