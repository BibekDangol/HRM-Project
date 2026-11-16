import { Tabs, usePathname, useRouter } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { StatusBar, Text, View } from "react-native";

import AppHeaderLeft from "@/src/components/navigation/header/AppHeaderLeft";
import AppHeaderRight from "@/src/components/navigation/header/AppHeaderRight";
import { adminTabs } from "@/src/config/adminTabs";
import { getTabScreenOptions } from "@/src/config/tabScreenOptions";
import { useAdminHeaderController } from "@/src/hooks/navigation/useAdminHeaderController";
import { useDimension } from "@/src/hooks/useDimension";
import { useHeaderMenu } from "@/src/hooks/useHeaderMenu";
import AdminTabBar from "@/src/components/navigation/tabbar/AdminTabBar";
import { TW } from "@/theme/twStyles";

type AdminTabItem = {
  name: string;
  title: string;
  icon?: LucideIcon;
};

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const sharedOptions = getTabScreenOptions(pathname);
  const menu = useHeaderMenu();
  const { isTablet, isSmallPhone } = useDimension();
  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;
  const typedAdminTabs = adminTabs as readonly AdminTabItem[];

  const [loadingAttendance] = useState(false);
  const isLocked = loadingAttendance;

  const {
    currentUserProfile,
    showBackButton,
    handleBackPress,
    handleProfileTrigger,
    handleProfileClose,
    handleProfilePress,
  } = useAdminHeaderController({
    pathname,
    router,
    menu,
    isLocked,
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={TW.bgSecondary} />

      <Tabs
        backBehavior="initialRoute"
        screenOptions={{
          ...sharedOptions,
          headerTitleStyle: {
            ...sharedOptions.headerTitleStyle,
            textAlign: "center",
            fontWeight: "600",
          },
          tabBarStyle: {
            backgroundColor: "#fff",
          },
          headerTitleContainerStyle: {
            justifyContent: "center",
          },
          headerLeftContainerStyle: {
            justifyContent: "flex-start",
          },
          headerRightContainerStyle: {
            justifyContent: "flex-end",
          },
          headerLeft: () => (
            <AppHeaderLeft visible={showBackButton} onPress={handleBackPress} />
          ),
          headerRight: () => (
            <AppHeaderRight
              variant="admin"
              isLocked={isLocked}
              profileMenuOpen={menu.open}
              onProfileTrigger={() => {
                handleProfileTrigger();
              }}
              onProfileClose={handleProfileClose}
              onProfilePress={handleProfilePress}
              onLogoutPress={menu.logout}
              profileButtonSize={buttonSize}
            />
          ),
        }}
        tabBar={(props) => <AdminTabBar {...props} />}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            headerTitle: () => (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}
                  >
                    {currentUserProfile?.first_name?.charAt(0)?.toUpperCase() ??
                      "A"}
                  </Text>
                </View>
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  {currentUserProfile?.first_name ?? "Admin"}
                </Text>
              </View>
            ),
            headerTitleAlign: "left",
          }}
        />

        {typedAdminTabs
          .filter((tab) => tab.name !== "dashboard")
          .map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{ title: tab.title }}
            />
          ))}

        <Tabs.Screen
          name="holidays"
          options={{
            title: "Holidays and Events",
            headerTitleAlign: "center",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: null,
            headerTitleAlign: "center",
          }}
        />
      </Tabs>
    </>
  );
}
