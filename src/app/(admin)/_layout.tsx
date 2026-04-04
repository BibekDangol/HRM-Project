import { Tabs, usePathname, useRouter } from "expo-router";
import { ChevronLeft, LucideIcon, User } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { BackHandler, Pressable, StatusBar, Text, View } from "react-native";

import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import { useDimension } from "@/src/hooks/useDimension";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
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

  const { user } = useAuthStore();
  const { userProfile, setUserProfile } = useUsersStore();

  const { isTablet, isSmallPhone } = useDimension();
  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;
  const typedAdminTabs = adminTabs as readonly AdminTabItem[];

  const ROOT_TAB_PATHS = [
    "/(admin)/dashboard",
    "/dashboard",
    "/(admin)/manage-users",
    "/manage-users",
    "/(admin)/more",
    "/more",
    "/(admin)/leave",
    "/leave",
    "/(admin)/profile",
    "/profile",
  ];

  const isRootTab = ROOT_TAB_PATHS.some(
    (path) => pathname === path || pathname === `${path}/index`,
  );

  const showBackButton = !isRootTab;
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || userProfile) return;
    const profile = await fetchCurrentUserProfleService(user.id);
    setUserProfile(profile);
  }, [user?.id, userProfile, setUserProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    const onBackPress = () => {
      // 🧠 If NOT root → go back normally
      if (!isRootTab) {
        router.back();
        return true;
      }

      // 🧠 If root BUT not dashboard → go to dashboard
      if (pathname !== "/(admin)/dashboard") {
        router.replace("/(admin)/dashboard");
        return true;
      }

      // 🧠 If already on dashboard → exit app
      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => sub.remove();
  }, [pathname, isRootTab, router]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={TW.bgSecondary} />

      <Tabs
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

          headerLeft: showBackButton
            ? () => (
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={10}
                  style={({ pressed }) => ({
                    marginLeft: 12,
                    padding: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <ChevronLeft size={26} color="#fff" />
                </Pressable>
              )
            : () => null,

          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <Pressable
                onPress={menu.toggle}
                style={{
                  height: buttonSize,
                  width: buttonSize,
                  borderRadius: buttonSize / 2,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                  // opacity: pressed ? 0.85 : 1,
                }}>
                <User size={17} color="#ffffff" />
              </Pressable>
            </View>
          ),
        }}
        tabBar={(props) => <AdminTabBar {...props} />}>
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
                    style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                    {userProfile?.first_name?.charAt(0)?.toUpperCase() ?? "A"}
                  </Text>
                </View>
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {userProfile?.first_name ?? "Admin"}
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
      </Tabs>

      {menu.open && (
        <>
          <Pressable
            onPress={menu.close}
            style={{
              position: "absolute",
              top: 100,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: 65,
              right: 16,
              zIndex: 1000,
              elevation: 50,
            }}>
            <ProfileMenu
              open={menu.open}
              onProfile={() => {
                menu.close();
                router.push("/(admin)/profile");
              }}
              onLogout={menu.logout}
            />
          </View>
        </>
      )}
    </>
  );
}
