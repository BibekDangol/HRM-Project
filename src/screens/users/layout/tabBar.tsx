import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { CalendarDays, House, LucideIcon, Menu } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_COLOR = "#008080";
const INACTIVE_COLOR = "#9CA3AF";
const PILL_H = 56;
const H_PADDING = 16;
const TRAY_PADDING = 4;
const PILL_RADIUS = 16;
const ICON_SIZE = 22;
const TAB_W = 100;

type TabCfg = { icon: LucideIcon; label: string };

const tabConfig: Record<string, TabCfg> = {
  dashboard: { icon: House, label: "Home" },
  leaves: { icon: CalendarDays, label: "Leaves" },
  more: { icon: Menu, label: "More" },
};

export function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route: any) => {
    const options = descriptors[route.key]?.options;
    return options?.href !== null && !!tabConfig[route.name];
  });

  const tabCount = visibleRoutes.length;
  const trayW = tabCount * TAB_W + TRAY_PADDING * 2;

  // -1 when active route is not in tabConfig (e.g. profile page)
  const focusedIdx = visibleRoutes.findIndex(
    (r: any) => r.key === state.routes[state.index]?.key,
  );

  // Only animate when we have a valid tab — freeze pill otherwise
  const pillTarget = focusedIdx >= 0 ? focusedIdx * TAB_W : null;

  const pillX = useRef(
    new Animated.Value(focusedIdx >= 0 ? focusedIdx * TAB_W : 0),
  ).current;

  useEffect(() => {
    if (pillTarget === null) return; // frozen when on non-tab route
    Animated.spring(pillX, {
      toValue: pillTarget,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [pillTarget]);

  const bottomPad = Math.max(insets.bottom, 8);

  const trayShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        }
      : { elevation: 6 };

  const pillShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: ACTIVE_COLOR,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
        }
      : { elevation: 4 };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        paddingHorizontal: H_PADDING,
        paddingTop: 8,
        paddingBottom: bottomPad,
        alignItems: "center",
      }}
    >
      <View
        style={[
          {
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 20,
            padding: TRAY_PADDING,
            position: "relative",
            height: PILL_H + TRAY_PADDING * 2,
            width: trayW,
          },
          trayShadow,
        ]}
      >
        {/* Sliding pill */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: TRAY_PADDING,
              left: TRAY_PADDING,
              width: TAB_W - TRAY_PADDING * 2,
              height: PILL_H,
              backgroundColor: "#FFFFFF",
              borderRadius: PILL_RADIUS,
              transform: [{ translateX: pillX }],
            },
            pillShadow,
          ]}
        />

        {visibleRoutes.map((route: any) => {
          // No tab is "active" when on a non-tab route like profile
          const isFocused =
            focusedIdx >= 0 && state.routes[state.index]?.key === route.key;

          const cfg = tabConfig[route.name];
          const Icon = cfg.icon;
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

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

          return (
            <PlatformPressable
              key={route.key}
              href={buildHref(route.name, route.params)}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={cfg.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                width: TAB_W,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 3,
                zIndex: 1,
                height: PILL_H,
              }}
            >
              <Icon
                size={ICON_SIZE}
                color={color}
                strokeWidth={isFocused ? 2.2 : 1.8}
              />
              <Text
                numberOfLines={1}
                style={{
                  color,
                  fontSize: 11,
                  fontWeight: Platform.OS === "ios" ? "600" : "bold",
                  letterSpacing: 0.2,
                }}
              >
                {cfg.label}
              </Text>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}
 