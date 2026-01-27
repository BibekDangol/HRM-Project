import * as React from "react";
import { Alert, View } from "react-native";
import tw from "twrnc";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable } from "react-native";
import { useCallback, useState } from "react";
import { ScrollView, RefreshControl } from "react-native";

import {
  useLinkBuilder,
  useTheme,
  useNavigation,
} from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/src/navigation/types";
import { useAuthStore } from "@/store/useAuthStore";
import ManageUsers from "./ManageUsers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";


/** This file is mounted by your Root Stack as: <Stack.Screen name="Admin" component={AdminScreen} /> */
type RootProps = NativeStackScreenProps<RootStackParamList, "Admin">;

/* ---------------- Custom Tab Bar (from your snippet) ---------------- */
function MyTabBar({ state, descriptors, navigation }: any) {
  const { colors } = useTheme();
  const { buildHref } = useLinkBuilder();
  const iconByRoute: Record<
    string,
    keyof typeof MaterialCommunityIcons.glyphMap
  > = {
    Dashboard: "view-dashboard",
    Employees: "account-group-outline",
    Leaves: "calendar-month-outline",
    More: "dots-horizontal",
  };
  const tabConfig: Record<
    string,
    {
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      iconSize?: number;
      mt?: number;
      pt?: number;
    }
  > = {
    Dashboard: { icon: "view-dashboard", iconSize: 26, mt: 2, pt: 2 },
    Employees: { icon: "account-group-outline", iconSize: 26, mt: 2, pt: 2 },
    Leaves: { icon: "calendar-month-outline", iconSize: 26, mt: 2, pt: 2 },
    More: { icon: "dots-horizontal", iconSize: 26, mt: 2, pt: 2 },
  };

  return (
    <View
      style={[
        tw`flex-row border-t border-gray-300 bg-gray-100`,
        {
          height: 80,
          paddingHorizontal: 18, 
          paddingTop: 8,
          paddingBottom: 16,
          // // shadow (ios)
          // shadowColor: "#000",
          // shadowOpacity: 0.08,
          // shadowRadius: 14,
          // shadowOffset: { width: 0, height: 6 },
          // // shadow (android)
          // elevation: 10,
        },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

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
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };
        const cfg = tabConfig[route.name] ?? {
          icon: "circle-outline",
          iconSize: 24,
          mt: 2,
          pt: 0,
        };
        const ACTIVE = "#1F7A4D"; // green (or whatever you want)
        const INACTIVE = "#374151"; // gray-900

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
              color={isFocused ? ACTIVE : INACTIVE}
            />
            {/* 
            <Text
              style={{
                color: isFocused ? colors.primary : "#111827",
                fontWeight: "700",
                fontSize: 12,
                marginTop: cfg.mt ?? 2,
              }}
            >
              {label}
            </Text> */}
          </PlatformPressable>
        );
      })}
    </View>
  );
}

function AdminDashboardTab() {
  const signOut = useAuthStore((s) => s.signOut);
  const navigation = useNavigation<any>();

  const onLogout = async () => {
    try {
      await signOut();
      // Back to Login in your ROOT stack
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? "Please try again.");
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // TODO: re-fetch your dashboard data here
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <SafeAreaView style={tw`flex-1 bg-[#F5F5F5]`}>
      <ScrollView
        contentContainerStyle={tw`px-4 pt-4 pb-8`}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1F7A4D"
            colors={["#1F7A4D"]}
          />
        }
      >
        <Text style={tw`text-2xl font-extrabold text-gray-800`}>
          Hello, Admin
        </Text>

        <Pressable
          onPress={() => navigation.navigate("ManageUsers")}
          style={({ pressed }: any) => [
            tw`h-[56px] rounded-2xl bg-[#1F7A4D] items-center justify-center mt-6`,
            pressed && tw`opacity-90`,
          ]}
        >
          <Text style={tw`text-white font-bold text-[18px]`}>Manage Users</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={({ pressed }: any) => [
            tw`h-[56px] rounded-2xl bg-white border border-gray-200 items-center justify-center mt-3`,
            pressed && tw`opacity-90`,
          ]}
        >
          <Text style={tw`text-gray-900 font-bold text-[18px]`}>
            Go to Home
          </Text>
        </Pressable>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => [tw`mt-6`, pressed && tw`opacity-80`]}
        >
          <Text style={tw`text-[#1F7A4D] font-semibold underline`}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// function EmployeesTab() {
//   return (
//     <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
//       <Text>Employees</Text>
//     </SafeAreaView>
//   );
// }

function LeavesTab() {
  return (
    <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
      <Text>Leaves</Text>
    </SafeAreaView>
  );
}

function MoreTab() {
  return (
    <SafeAreaView style={tw`flex-1 bg-[#F5F5F5] items-center justify-center`}>
      <Text>More</Text>
    </SafeAreaView>
  );
}

/* ---------------- Bottom Tabs ---------------- */

type AdminTabParamList = {
  Dashboard: undefined;
  Employees: undefined;
  Leaves: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<AdminTabParamList>();

export default function AdminScreen(_props: RootProps) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: "absolute" }, // so it floats nicely
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardTab} />
      <Tab.Screen name="Employees" component={ManageUsers} />
      <Tab.Screen name="Leaves" component={LeavesTab} />
      <Tab.Screen name="More" component={MoreTab} />
    </Tab.Navigator>
  );
}
