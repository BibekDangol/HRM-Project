import { AppHeaderRight, AppScreenLayout, HomePageIntro } from "@/src/components/navigation/header/AppHeader";
import { colors } from "@/theme/colors";
import { Tabs, usePathname, useRouter } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { StatusBar } from "react-native";

import { adminTabs } from "@/src/config/adminTabs";
import { getTabScreenOptions } from "@/src/config/tabScreenOptions";
import { useAdminHeaderController } from "@/src/hooks/navigation/useAdminHeaderController";
import { useDimension } from "@/src/hooks/useDimension";
import { useHeaderMenu } from "@/src/hooks/useHeaderMenu";
import AdminTabBar from "@/src/components/navigation/tabbar/AdminTabBar";

type AdminTabItem = {
  name: string;
  title: string;
  icon?: LucideIcon;
};

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const sharedOptions = getTabScreenOptions();
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.canvas}
      />

      <Tabs
        backBehavior="initialRoute"
        screenLayout={({ children, route }) => (
          <AppScreenLayout
            isHome={route.name === "dashboard"}
            backgroundColor={colors.canvas}
            homeContent={
              <HomePageIntro name={currentUserProfile?.first_name ?? "Admin"}>
                <AppHeaderRight
                  variant="admin"
                  isLocked={isLocked}
                  profileMenuOpen={menu.open}
                  onProfileTrigger={handleProfileTrigger}
                  onProfileClose={handleProfileClose}
                  onProfilePress={handleProfilePress}
                  onLogoutPress={menu.logout}
                  profileButtonSize={buttonSize}
                />
              </HomePageIntro>
            }
            onBack={!pathname.endsWith("/attendance-list") && (showBackButton || route.name === "profile" || route.name === "holidays") ? handleBackPress : undefined}
          >
            {children}
          </AppScreenLayout>
        )}
        screenOptions={{
          ...sharedOptions,
          tabBarStyle: { backgroundColor: colors.surface },
        }}
        tabBar={(props) => <AdminTabBar {...props} />}
      >
        <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />

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
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}
