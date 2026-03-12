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

const PRIMARY = "#008080";

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

  const showBackButton = !adminTabs.some((tab) => pathname?.includes(tab.name));

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: PRIMARY,
          height: headerHeight + insets.top, // respect status bar on all devices
        },
        headerTitleAlign: "center",

        headerLeft: showBackButton
          ? () => (
              <Pressable
                onPress={() => router.back()}
                style={{
                  marginLeft: sideMargin,
                  height: buttonSize,
                  width: buttonSize,
                  borderRadius: avatarRadius,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowLeft size={backIconSize} color="#ffffff" />
              </Pressable>
            )
          : () => null,

        headerTitle: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: isSmallDevice ? 6 : 10,
              // Cap width so it doesn't overflow on small screens
              maxWidth: screenWidth - sideMargin * 2 - buttonSize * 2 - 24,
            }}
          >
            {/* Avatar circle */}
            <View
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarRadius,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: avatarFontSize,
                  fontWeight: "700",
                }}
              >
                {userProfile?.first_name?.charAt(0)?.toUpperCase() ?? "A"}
              </Text>
            </View>

            {/* Name — truncates gracefully on small screens */}
            <Text
              numberOfLines={1}
              style={{
                color: "#ffffff",
                fontSize: titleFontSize,
                fontWeight: "700",
                flexShrink: 1,
              }}
            >
              {userProfile?.first_name ?? "Admin"}
            </Text>
          </View>
        ),

        headerRight: () => (
          <View
            style={{
              marginRight: sideMargin,
              position: "relative",
            }}
          >
            <Pressable
              onPress={menu.toggle}
              style={({ pressed }) => ({
                height: buttonSize,
                width: buttonSize,
                borderRadius: buttonSize / 2,
                backgroundColor: "rgba(255,255,255,0.15)",
                borderWidth: isTablet ? 2.5 : 2,
                borderColor: "rgba(255,255,255,0.5)",
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <User size={iconSize} color="#ffffff" />
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
