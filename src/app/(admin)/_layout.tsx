import { Tabs, usePathname, useRouter } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const menu = useAdminHeaderMenu();
  const { user, loading } = useAuthStore();
  const { userProfile, setUserProfile } = useUsersStore();

  // ── Responsive hooks ─────────────────────────────────────────────
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;
  const isLandscape = screenWidth > screenHeight;

  // Scale values based on device type
  const headerHeight = isTablet ? 64 : isLandscape ? 48 : 56;
  const avatarSize = isTablet ? 38 : isSmallDevice ? 28 : 32;
  const avatarRadius = isTablet ? 14 : 12;
  const iconSize = isTablet ? 20 : isSmallDevice ? 15 : 17;
  const titleFontSize = isTablet ? 18 : isSmallDevice ? 14 : 16;
  const avatarFontSize = isTablet ? 15 : isSmallDevice ? 11 : 13;
  const buttonSize = isTablet ? 42 : isSmallDevice ? 32 : 36;
  const backIconSize = isTablet ? 24 : isSmallDevice ? 18 : 20;
  const sideMargin = isTablet ? 20 : 16;
  // ─────────────────────────────────────────────────────────────────

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || userProfile) return;
    const profile = await fetchCurrentUserProfleService(user?.id);
    setUserProfile(profile);
  }, [user?.id, setUserProfile, userProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, loading]);

  // Show back button if not on a main tab
  const showBackButton = !adminTabs.some((tab) => pathname?.includes(tab.name));

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: TW.bgSecondary,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          height: 100,
        },
        headerTitle: "",

        // 👇 re-evaluated on every render because AdminLayout re-renders on pathname change
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
          : () => null, // 👈 always a function — avoids stale cached value

        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
                style={{ color: "#ffffff", fontSize: 13, fontWeight: "700" }}
              >
                {userProfile?.first_name?.charAt(0)?.toUpperCase() ?? "A"}
              </Text>
            </View>
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "700" }}>
              {userProfile?.first_name ?? "Admin"}
            </Text>
            ),

        // Right: profile icon
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