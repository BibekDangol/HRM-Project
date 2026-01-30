import { useAuthStore } from "@/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import * as React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import tw from "twrnc";

/* ---------------- Custom Tab Bar ---------------- */
function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();

  const tabConfig: Record<
    string,
    {
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      iconSize?: number;
      pt?: number;
    }
  > = {
    dashboard: { icon: "view-dashboard", iconSize: 26, pt: 2 },
    "manage-users": { icon: "account-outline", iconSize: 26, pt: 2 },
    leaves: { icon: "calendar-month-outline", iconSize: 26, pt: 2 },
    more: { icon: "dots-horizontal", iconSize: 26, pt: 2 },
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
      {visibleRoutes.map((route: any, index: number) => {
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
            <MaterialCommunityIcons
              name={cfg.icon}
              size={cfg.iconSize ?? 24}
              color={isFocused ? "#1F7A4D" : "#374151"}
            />
          </PlatformPressable>
        );
      })}
    </View>
  );
}

// /* ---------------- Expo Router Tabs Layout ---------------- */
// export default function AdminTabsLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         headerShown: true, // ✅ Top bar enabled
//         headerTitleAlign: "left",
//         headerStyle: { backgroundColor: "#F2F6FC" },
//         headerTitleStyle: { color: "#0C0C0C", fontWeight: "800" },
//         headerShadowVisible: false,
//       }}
//       tabBar={(props) => <MyTabBar {...props} />}

//     >
//       <Tabs.Screen name="dashboard" options={{ title: "Dashboard", }} />
//       <Tabs.Screen name="manage_users" />
//       <Tabs.Screen name="leaves" />
//       <Tabs.Screen name="more" />
//     </Tabs>
//   );
// }
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
            {/* Right icons row */}
            <View style={tw`flex-row items-center`}>
              {/* Bell */}
              {/* <Pressable
                onPress={() => router.push("/(admin)/notifications")}
                style={({ pressed }) => [pressed && tw`opacity-80`]}
                hitSlop={10}
              >
                <Ionicons
                  name="notifications-outline"
                  size={22}
                  color="#0C0C0C"
                />
              </Pressable> */}

              {/* Profile icon (toggles dropdown) */}
              <Pressable
                onPress={() => setMenuOpen((v) => !v)}
                style={({ pressed }) => [tw`ml-3`, pressed && tw`opacity-80`]}
                hitSlop={10}
              >
                <View
                  style={tw`w-9 h-9 rounded-full bg-white border border-[#E5E5E5] items-center justify-center`}
                >
                  <Ionicons name="person" size={18} color="#0C0C0C" />
                </View>
              </Pressable>
            </View>
            {/*For the Drop Down*/}
            {menuOpen ? (
              <View
                style={[
                  tw`absolute right-0 top-12 bg-white border border-[#E5E5E5] p-2`,
                  { width: 150 },
                ]}
              >
                {/*For Profile*/}
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
                  <Ionicons name="person-outline" size={18} color="#0C0C0C" />
                  <Text style={tw`ml-2 font-bold text-[#0C0C0C]`}>Profile</Text>
                </Pressable>

                {/*Divider Line*/}
                <View style={tw`h-px bg-[#E5E5E5] my-1`}></View>

                {/*For Logout */}
                <Pressable
                  onPress={onLogout}
                  style={({ pressed }) => [
                    tw`flex-row items-center px-3 py-2`,
                    pressed && tw`opacity-80`,
                  ]}
                >
                  <Ionicons name="log-out-outline" size={18} color="#FF4D4F" />
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
