import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { Tabs } from "expo-router";
import * as React from "react";
import { View } from "react-native";
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
    dashboard: { icon: "home", iconSize: 26, pt: 2 },
    leaves: { icon: "calendar-month-outline", iconSize: 26, pt: 2 },
    more: { icon: "dots-horizontal", iconSize: 26, pt: 2 },
  };

  return (
    <View
      style={[
        tw`flex-row border-t border-gray-300 bg-gray-100`,
        { height: 80, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 16 },
      ]}
    >
      {state.routes.map((route: any, index: number) => {
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
          navigation.emit({ type: "tabLongPress", target: route.key });
        };

        const cfg = tabConfig[route.name] ?? {
          icon: "circle-outline",
          iconSize: 24,
          pt: 0,
        };

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

/* ---------------- Expo Router Tabs Layout ---------------- */
export default function UsersTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { position: "absolute" },
      }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="leaves" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}
