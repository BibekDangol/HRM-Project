import { colors } from "@/theme/colors";
import { useIsRootTab } from "@/src/hooks/navigation/useIsRootTab";
import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const rootPaths = ["/dashboard", "/leaves", "/more"];

export default function TabLayout() {
  const isRootTab = useIsRootTab({ pathname: usePathname(), rootPaths });

  return (
    <NativeTabs
      hidden={!isRootTab}
      tintColor={colors.primary}
      backgroundColor={colors.surface}
      blurEffect="none"
      disableTransparentOnScrollEdge
      iconColor={{ default: colors.muted, selected: colors.primary }}
      labelStyle={{ default: { color: colors.muted }, selected: { color: colors.primary } }}
      indicatorColor={colors.primarySoft}
      labelVisibilityMode="labeled"
      backBehavior="initialRoute"
      unstable_nativeProps={{ colorScheme: "light", nativeContainerStyle: { backgroundColor: colors.canvas } }}
    >
      <NativeTabs.Trigger name="dashboard" contentStyle={{ backgroundColor: colors.canvas }}>
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leaves" contentStyle={{ backgroundColor: colors.canvas }}>
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
