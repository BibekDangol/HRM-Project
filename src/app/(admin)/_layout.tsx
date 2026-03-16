import { Tabs, usePathname, useRouter } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDimension } from "@/src/hooks/useDimension";

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const menu = useAdminHeaderMenu();
  const { user, loading } = useAuthStore();
  const { userProfile, setUserProfile } = useUsersStore();

  const {
    width: screenWidth,
    height: screenHeight,
    isTablet,
    isSmallPhone,
  } = useDimension();

  const insets = useSafeAreaInsets();
  const isLandscape = screenWidth > screenHeight;
  const buttonSize = isTablet ? 42 : isSmallPhone ? 32 : 36;
  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || userProfile) return;
    const profile = await fetchCurrentUserProfleService(user?.id);
    setUserProfile(profile);
  }, [user?.id, setUserProfile, userProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, loading]);

  const showBackButton = !adminTabs.some((tab) => pathname?.includes(tab.name));

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: "left",

        sceneStyle: {
          backgroundColor: pathname?.includes("/profile")
            ? TW.bgSecondary
            : "#ffffff",
        },

        tabBarStyle: {
          backgroundColor: "#ffffff",
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
                onPress={() => router.back()}
                style={{
                  marginLeft: 16,
                  height: 36,
                  width: 36,
                  borderRadius: 12,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={20} color="#ffffff" />
              </Pressable>
            )
          : () => null,

        headerTitle: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
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
                style={{
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: "700",
                }}
              >
                {userProfile?.first_name?.charAt(0)?.toUpperCase() ?? "A"}
              </Text>
            </View>

            <Text
              style={{
                color: "#ffffff",
                fontSize: 16,
                fontWeight: "700",
              }}
            >
              {userProfile?.first_name ?? "Admin"}
            </Text>
          </View>
        ),

        headerRight: () => (
          <View style={{ marginRight: 16, position: "relative" }}>
            <Pressable
              onPress={menu.toggle}
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
              })}
            >
              <User size={17} color="#ffffff" />
            </Pressable>

            <ProfileMenu
              open={menu.open}
              onProfile={() => {
                menu.close?.();
                router.push("/(admin)/profile");
              }}
              onLogout={menu.logout}
            />
          </View>
        ),
      }}
      tabBar={(props) => <AdminTabBar {...props} />}
    >
      {adminTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </Tabs>
  );
}
