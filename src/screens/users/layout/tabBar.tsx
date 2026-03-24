import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import {
  CalendarDays,
  House,
  HouseIcon,
  LucideIcon,
  Menu,
} from "lucide-react-native";
import React, { useMemo } from "react";
import { Platform, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACTIVE_COLOR = "#1B4A5A";
const INACTIVE_COLOR = "#8A94A6";

const H_PADDING = 16;
const TRAY_PADDING = 8;
const TRAY_RADIUS = 24;

type TabCfg = {
  icon: LucideIcon;
  activeIcon?: LucideIcon;
  label: string;
};

const tabConfig: Record<string, TabCfg> = {
  dashboard: { icon: House, activeIcon: HouseIcon, label: "Home" },
  leaves: { icon: CalendarDays, label: "Leaves" },
  more: { icon: Menu, label: "More" },
};

export function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;

  const TAB_HEIGHT = isTablet ? 58 : isSmallDevice ? 48 : 54;
  const ICON_SIZE = isTablet ? 26 : isSmallDevice ? 20 : 23;
  const FONT_SIZE = isTablet ? 13 : isSmallDevice ? 10 : 11;

  const visibleRoutes = useMemo(() => {
    return state.routes.filter((route: any) => {
      const options = descriptors[route.key]?.options;
      return options?.href !== null && !!tabConfig[route.name];
    });
  }, [state.routes, descriptors]);

  const tabCount = visibleRoutes.length || 1;

  const maxTrayWidth = isTablet ? 460 : 360;
  const trayWidth = Math.min(screenWidth - H_PADDING * 2, maxTrayWidth);
  const innerWidth = trayWidth - TRAY_PADDING * 2;
  const tabWidth = innerWidth / tabCount;

  const bottomPad = Math.max(insets.bottom, 10);

  const trayShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        }
      : { elevation: 6 };

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: 8,
        paddingBottom: bottomPad,
        alignItems: "center",
      }}
    >
      <View
        style={[
          {
            width: trayWidth,
            minHeight: TAB_HEIGHT + TRAY_PADDING * 2,
            borderRadius: TRAY_RADIUS,
            backgroundColor: "#F3F4F6",
            padding: TRAY_PADDING,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          },
          trayShadow,
        ]}
      >
        {visibleRoutes.map((route: any) => {
          const isFocused = state.routes[state.index]?.key === route.key;

          const cfg = tabConfig[route.name];
          const InactiveIcon = cfg.icon;
          const ActiveIcon = cfg.activeIcon ?? cfg.icon;
          const IconToRender = isFocused ? ActiveIcon : InactiveIcon;

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
                width: tabWidth,
                height: TAB_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 18,
                backgroundColor: "transparent",
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                }}
              >
                <IconToRender
                  size={ICON_SIZE}
                  color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  strokeWidth={isFocused ? 2.4 : 1.9}
                />

                <Text
                  style={{
                    fontSize: FONT_SIZE,
                    color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR,
                    fontWeight: isFocused ? "700" : "600",
                  }}
                >
                  {cfg.label}
                </Text>
              </View>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}
