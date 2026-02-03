import { useAuthStore } from "@/store/useAuthStore";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import * as React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import tw from "twrnc";
import {
  LogOut,
  UserCircle,
  User,
  LayoutDashboard,
  Users,
  CalendarDays,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react-native";

/* ---------------- Custom Tab Bar ---------------- */
function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();

  const tabConfig: Record<
    string,
    {
      icon: LucideIcon;
      iconSize?: number;
      pt?: number;
    }
  > = {
    dashboard: { icon: LayoutDashboard, iconSize: 26, pt: 2 },
    "manage-users": { icon: Users, iconSize: 26, pt: 2 },
    leaves: { icon: CalendarDays, iconSize: 26, pt: 2 },
    more: { icon: MoreHorizontal, iconSize: 26, pt: 2 },
  };

  const visibleRoutes = state.routes.filter((route: any) => {
    const options = descriptors[route.key]?.options;
    const isHidden = options?.href === null;
    const isInTabConfig = !!tabConfig[route.name];
    return !isHidden && isInTabConfig;
  });

  return (
    <View
      style={[
        tw`flex-row border-t border-gray-300 bg-gray-100`,
        { height: 80, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
      ]}
    >
      {visibleRoutes.map((route: any) => {
        const isFocused = state.routes[state.index]?.key === route.key;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const cfg = tabConfig[route.name];
        const Icon = cfg.icon;

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              tw`flex-1 items-center justify-center`,
              cfg.pt ? { paddingTop: cfg.pt } : null,
            ]}
          >
            <Icon
              size={cfg.iconSize ?? 24}
              color={isFocused ? "#1F7A4D" : "#374151"}
            />
          </PlatformPressable>
        );
      })}
    </View>
  );
}

/* ---------------- Expo Router Tabs Layout ---------------- */
export default function AdminLayout() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const [menuOpen, setMenuOpen] = React.useState(false);

  const onLogout = async () => {
    try {
      setMenuOpen(false);
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        headerStyle: { backgroundColor: "#ffffff" },
        headerShadowVisible: false,

        headerRight: () => (
          <View style={tw`mr-4`}>
            <View style={tw`flex-row items-center`}>
              {/* Profile icon (toggles dropdown) */}
              <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                style={({ pressed }) => [tw`ml-3`, pressed && tw`opacity-80`]}
                hitSlop={10}
              >
                <View
                  style={tw`w-9 h-9 rounded-full bg-white border border-[#E5E5E5] items-center justify-center`}
                >
                  <User size={18} color="#0C0C0C" />
                </View>
              </Pressable>
            </View>

            {/* Dropdown */}
            {menuOpen ? (
              <View
                style={[
                  tw`absolute right-0 top-12 bg-white border border-[#E5E5E5] p-2`,
                  { width: 150 },
                ]}
              >
                {/* Profile */}
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    router.push("/(admin)/profile");
                  }}
                  style={({ pressed }) => [
                    tw`flex-row items-center px-3 py-2`,
                    pressed && tw`opacity-80`,
                  ]}
                >
                  <UserCircle size={18} color="#0C0C0C" />
                  <Text style={tw`ml-2 font-bold text-[#0C0C0C]`}>Profile</Text>
                </Pressable>

                {/* Divider */}
                <View style={tw`h-px bg-[#E5E5E5] my-1`} />

                {/* Logout */}
                <Pressable
                  onPress={onLogout}
                  style={({ pressed }) => [
                    tw`flex-row items-center px-3 py-2`,
                    pressed && tw`opacity-80`,
                  ]}
                >
                  <LogOut size={18} color="#FF4D4F" />
                  <Text style={tw`ml-2 font-bold text-[#FF4D4F]`}>Logout</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ),
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="manage-users" options={{ title: "Manage Users" }} />
      <Tabs.Screen name="leaves" options={{ title: "Leave Requests" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          href: null,
        }}
      />
    </Tabs>
  );
}
