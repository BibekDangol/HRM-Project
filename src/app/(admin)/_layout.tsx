import { Tabs, usePathname, useRouter } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import { StatusBar, Text, View } from "react-native";

import AppHeaderLeft from "@/src/components/navigation/header/AppHeaderLeft";
import AppHeaderRight from "@/src/components/navigation/header/AppHeaderRight";
import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderController } from "@/src/hooks/navigation/useAdminHeaderController";
import { useDimension } from "@/src/hooks/useDimension";
import { useAdminHeaderMenu } from "@/src/hooks/useHeaderMenu";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import { TW } from "@/theme/twStyles";

type AdminTabItem = {
  name: string;
  title: string;
  icon?: LucideIcon;
};

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const menu = useAdminHeaderMenu();

  const [checkOpen, setCheckOpen] = useState(false);
  const { isTablet, isSmallPhone } = useDimension();
  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;
  const typedAdminTabs = adminTabs as readonly AdminTabItem[];
  const checkActionLockRef = useRef(false);
  const [loadingAttendance] = useState(false);
  const isLocked = loadingAttendance || checkActionLockRef.current;

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
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: "#fff",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600",
          },
          sceneStyle: {
            backgroundColor: pathname.includes("/profile")
              ? TW.bgSecondary
              : "#fff",
          },
          tabBarStyle: {
            backgroundColor: "#fff",
          },
          headerStyle: {
            backgroundColor: TW.bgSecondary,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            height: 100,
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
                setCheckOpen(false);
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
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
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
          name="leave/add-leave-type"
          options={{
            title: "Add Leave Type",
            headerTitleAlign: "center",
          }}
        />

        <Tabs.Screen
          name="more/attendance-list/index"
          options={{
            title: "Attendance List",
            headerTitleAlign: "center",
          }}
        />

        <Tabs.Screen
          name="more/attendance-list/attendance-details"
          options={{
            title: "Attendance Details",
            headerTitleAlign: "center",
          }}
        />

        <Tabs.Screen
          name="more/holidays/index"
          options={{
            title: "Holidays and Events",
            headerTitleAlign: "center",
          }}
        />
      </Tabs>
    </>
  );
}
