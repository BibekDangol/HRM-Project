import { Tabs, usePathname, useRouter } from "expo-router";
import { ArrowLeft, LucideIcon, User } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [checkOpen, setCheckOpen] = useState(false);
  const { isTablet, isSmallPhone } = useDimension();

  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;
  const typedAdminTabs = adminTabs as readonly AdminTabItem[];
  const checkActionLockRef = useRef(false);
  const [loadingAttendance] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || userProfile) return;

    const profile = await fetchCurrentUserProfleService(user.id);
    setUserProfile(profile);
  }, [user?.id, userProfile, setUserProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  /**
   * BACK HANDLER
   */
  useEffect(() => {
    const TAB_ROOTS = ["/dashboard", "/manage-users", "/leave", "/more"];
    const onBackPress = () => {
      const isTabRoot = TAB_ROOTS.includes(pathname);
      if (router.canGoBack()) {
        router.back();
        return true;
      }

      if (isTabRoot && !pathname.includes("dashboard")) {
        router.replace("/(admin)/dashboard");
        return true;
      }

      return false;
    };

    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => sub.remove();
  }, [pathname, router]);

  const showBackButton = !typedAdminTabs.some((tab) =>
    pathname.includes(tab.name),
  );

  const isLocked = loadingAttendance || checkActionLockRef.current;

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={TW.bgSecondary} />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerShadowVisible: false,
          headerTitleAlign: "left",
          headerTitleStyle: {
            color: "#fff", // ✅ title white
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

          headerLeft: showBackButton
            ? () => (
                <Pressable
                  style={{
                    marginLeft: 16,
                    height: 36,
                    width: 36,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <ArrowLeft size={20} color="#fff" />
                </Pressable>
              )
            : () => null,
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <Pressable
                disabled={isLocked}
                onPress={() => {
                  if (isLocked) return;
                  setCheckOpen(false);
                  menu.toggle();
                }}
                style={({ pressed }) => ({
                  height: buttonSize,
                  width: buttonSize,
                  borderRadius: buttonSize / 2,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: pressed ? 0.75 : 1,
                })}>
                <User size={17} color="#ffffff" />
              </Pressable>

              {menu.open && (
                <>
                  <Pressable
                    onPress={menu.close}
                    style={{
                      position: "absolute",
                      top: -1000,
                      left: -1000,
                      right: -1000,
                      bottom: -1000,
                    }}
                  />

                  <View
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 0,
                      zIndex: 9999,
                      elevation: 20,
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
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                }}>
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
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      fontWeight: "700",
                    }}>
                    {userProfile?.first_name?.charAt(0)?.toUpperCase() ?? "A"}
                  </Text>
                </View>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: "700",
                  }}>
                  {userProfile?.first_name ?? "Admin"}
                </Text>
              </View>
            ),
          }}
        />
        {typedAdminTabs
          .filter((tab) => tab.name !== "dashboard")
          .map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.title,
              }}
            />
          ))}
      </Tabs>
    </>
  );
}
