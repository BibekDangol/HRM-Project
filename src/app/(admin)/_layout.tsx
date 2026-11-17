import { AppHeaderRight, AppScreenLayout, HomeScreenHeaderContext, HomePageIntro } from "@/src/components/navigation/header/AppHeader";
import { colors } from "@/theme/colors";
import { Stack, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { StatusBar } from "react-native";

import { useAdminHeaderController } from "@/src/hooks/navigation/useAdminHeaderController";
import { useDimension } from "@/src/hooks/useDimension";
import { useHeaderMenu } from "@/src/hooks/useHeaderMenu";

export const unstable_settings = { initialRouteName: "(main-tabs)" };

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const menu = useHeaderMenu();
  const { isTablet, isSmallPhone } = useDimension();
  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;

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
    <HomeScreenHeaderContext.Provider value={
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
    }>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.canvas}
      />

      <Stack
        screenLayout={({ children, route }) => (
          <AppScreenLayout
            isHome={false}
            insetBottom={route.name !== "(main-tabs)"}
            backgroundColor={colors.canvas}
            onBack={!pathname.endsWith("/attendance-list") && (showBackButton || route.name === "profile" || route.name === "holidays") ? handleBackPress : undefined}
          >
            {children}
          </AppScreenLayout>
        )}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}
      >
        <Stack.Screen name="(main-tabs)" />
        <Stack.Screen name="holidays" />
        <Stack.Screen name="profile" />
      </Stack>
    </HomeScreenHeaderContext.Provider>
  );
}
