import { AppHeaderRight, AppScreenLayout, HomeScreenHeaderContext } from "@/src/components/navigation/header/AppHeader";
import { colors } from "@/theme/colors";
import { Stack, usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { Image, StatusBar, Text, View } from "react-native";

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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Image source={require("@/src/assets/images/oddoo-hrm-symbol-v1.png")} style={{ width: 36, height: 36, borderRadius: 8 }} resizeMode="contain" accessibilityLabel="Oddooo HRM" />
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={{ fontSize: 17, lineHeight: 22, fontWeight: "700", color: colors.ink }}>Oddooo HRM</Text>
          <Text style={{ fontSize: 11, lineHeight: 16, color: colors.muted }}>{currentUserProfile?.first_name ?? "Admin"} · Admin workspace</Text>
        </View>
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
      </View>
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
