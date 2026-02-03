import { useAuthStore } from "@/store/useAuthStore";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import {
  CalendarDays,
  CircleCheck,
  CircleX,
  House,
  LogOut,
  MoreHorizontal,
  User,
  UserCircle,
  type LucideIcon,
} from "lucide-react-native";
import * as React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import tw from "twrnc";

// Helpers
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err == "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return "Please try again.";
  }
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatSinceTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h == 0) return `${pad2(m)}: ${pad2(s)}`;
  return `${pad2(h)}: ${pad2(m)}: ${pad2(s)}`;
}
/* Custom Tab Bar */
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
    dashboard: { icon: House, iconSize: 26, pt: 2 },
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
export default function UsersTabsLayout() {
  const router = useRouter();
  const signOut = useAuthStore((s) => s.signOut);

  const [menuOpen, setMenuOpen] = React.useState(false);
  const [checkOpen, setCheckOpen] = React.useState(false);

  const [checkedInAt, setCheckedInAt] = React.useState<Date | null>(null);
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    if (!checkedInAt) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [checkedInAt]);

  const isCheckedIn = !!checkedInAt;
  const elaspedMs = checkedInAt ? now - checkedInAt.getTime() : 0;

  const onLogout = async () => {
    try {
      setMenuOpen(false);
      setCheckOpen(false);
      await signOut();
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };

  const onToggleCheck = async () => {
    try {
      setCheckOpen(false);

      if (!isCheckedIn) {
        // CHECK IN
        setCheckedInAt(new Date());

        return;
      }
      setCheckedInAt(null);
      // TODO: update supabase if you want
    } catch (err: unknown) {
      Alert.alert("Check action failed", getErrorMessage(err));
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
              {/* CHECK (dropdown) */}
              <View style={{ position: "relative" }}>
                <Pressable
                  onPress={() => {
                    setMenuOpen(false);
                    setCheckOpen((v) => !v);
                  }}
                  style={({ pressed }) => [tw`ml-3`, pressed && tw`opacity-80`]}
                  hitSlop={10}
                >
                  {isCheckedIn ? (
                    <CircleCheck size={22} color="#16A34A" />
                  ) : (
                    <CircleX size={22} color="#EF4444" />
                  )}
                </Pressable>
                {checkOpen ? (
                  <View
                    style={[
                      tw`absolute right-0 top-12 bg-white border  p-2 rounded-xl items-center justify-center border-[#E5E5E5] w-35`,
                    ]}
                  >
                    {isCheckedIn ? (
                      <>
                        <Text style={tw`text-gray-500`}>
                          Since {formatSinceTime(checkedInAt!)}
                        </Text>
                        <Text
                          style={tw`mt-1 text-3xl font-bold text-[#0C0C0C]`}
                        >
                          {formatElapsed(elaspedMs)}
                        </Text>
                        <Pressable
                          onPress={onToggleCheck}
                          style={({ pressed }) => [
                            tw`mt-3 rounded-xl px-4 py-3 items-center justify-center `,
                            {
                              backgroundColor: "#EF4444",
                              opacity: pressed ? 0.85 : 1,
                            },
                          ]}
                        >
                          <Text style={tw`text-white font-bold`}>
                            Check out
                          </Text>
                        </Pressable>
                      </>
                    ) : (
                      <Pressable
                        onPress={onToggleCheck}
                        style={({ pressed }) => [
                          tw`rounded-xl px-4 py-3 flex-row items-center justify-center`,
                          {
                            backgroundColor: "#FFFFFF",
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <CircleCheck size={20} color="#16A34A" />
                        <Text style={tw`ml-2 font-bold text-[#16A34A]`}>
                          CheckIn
                        </Text>
                      </Pressable>
                    )}
                  </View>
                ) : null}
              </View>

              {/*Profile*/}
              <View style={{ position: "relative" }}>
                <Pressable
                  onPress={() => {
                    setCheckOpen(false);
                    setMenuOpen((v) => !v);
                  }}
                  style={({ pressed }) => [tw`ml-3`, pressed && tw`opacity-80`]}
                  hitSlop={10}
                >
                  <View
                    style={tw`w-9 h-9 rounded-full bg-white border border-[#E5E5E5] items-center justify-center`}
                  >
                    <User size={18} color="#0C0C0C" />
                  </View>
                </Pressable>
                {menuOpen ? (
                  <View
                    style={[
                      tw`absolute right-0 top-12 bg-white border border-[#E5E5E5] p-2 rounded-xl`,
                      { width: 150 },
                    ]}
                  >
                    <Pressable
                      onPress={() => {
                        setMenuOpen(false);
                        router.push("/(users)/profile");
                      }}
                      style={({ pressed }) => [
                        tw`flex-row items-center px-3 py-2`,
                        pressed && tw`opacity-80`,
                      ]}
                    >
                      <UserCircle size={18} color="#0C0C0C" />
                      <Text style={tw`ml-2 font-bold text-[#0C0C0C]`}>
                        Profile
                      </Text>
                    </Pressable>

                    <View style={tw`h-px bg-[#E5E5E5] my-1`} />

                    <Pressable
                      onPress={onLogout}
                      style={({ pressed }) => [
                        tw`flex-row items-center px-3 py-2`,
                        pressed && tw`opacity-80`,
                      ]}
                    >
                      <LogOut size={20} color="#FF4D4F" />
                      <Text style={tw`ml-2 font-bold text-[#FF4D4F]`}>
                        Logout
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ),
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="leaves" options={{ title: "Leaves" }} />
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
