import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder, useNavigationState } from "@react-navigation/native";
import { RelativePathString, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BaseTabBarMode, TabBarItemConfig } from "./types";

type Props = {
  state: any;
  descriptors: any;
  navigation: any;
  tabs: readonly TabBarItemConfig[];
  mode: BaseTabBarMode;
  routeGroup: "(users)" | "(admin)";
  activeColor?: string;
  inactiveColor?: string;
};

const H_PADDING = 16;
const TRAY_PADDING_SIMPLE = 8;
const TRAY_PADDING_PILL = 4;

export default function BaseTabBar({
  state,
  descriptors,
  navigation,
  tabs,
  mode,
  routeGroup,
  activeColor = "#1B4A5A",
  inactiveColor = "#8A94A6",
}: Props) {
  const { buildHref } = useLinkBuilder();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;
  const isLandscape = screenWidth > screenHeight;

  const trayPadding = mode === "pill" ? TRAY_PADDING_PILL : TRAY_PADDING_SIMPLE;
  const trayRadius = mode === "pill" ? 20 : 24;

  const tabHeight =
    mode === "pill"
      ? isTablet
        ? 60
        : isSmallDevice || isLandscape
          ? 48
          : 54
      : isTablet
        ? 58
        : isSmallDevice
          ? 48
          : 54;

  const iconSize =
    mode === "pill"
      ? isTablet
        ? 26
        : isSmallDevice
          ? 19
          : 22
      : isTablet
        ? 26
        : isSmallDevice
          ? 20
          : 23;

  const fontSize =
    mode === "pill"
      ? isTablet
        ? 13
        : isSmallDevice
          ? 10
          : 11
      : isTablet
        ? 13
        : isSmallDevice
          ? 10
          : 11;

  const visibleRoutes = useMemo(() => {
    return state.routes.filter((route: any) => {
      const options = descriptors?.[route.key]?.options;
      return options?.href !== null && tabs.some((tab) => tab.name === route.name);
    });
  }, [state.routes, descriptors, tabs]);

  const tabCount = Math.max(visibleRoutes.length || tabs.length, 1);

  const maxTrayWidth =
    mode === "pill" ? (isTablet ? 520 : screenWidth) : isTablet ? 460 : 360;

  const sideInsets =
    Math.max(H_PADDING, insets.left) + Math.max(H_PADDING, insets.right);
  const availableWidth =
    mode === "pill"
      ? Math.min(maxTrayWidth, screenWidth) - sideInsets
      : Math.min(screenWidth - H_PADDING * 2, maxTrayWidth);

  const tabWidth =
    mode === "pill"
      ? Math.floor((availableWidth - trayPadding * 2) / tabCount)
      : (availableWidth - trayPadding * 2) / tabCount;

  const trayWidth =
    mode === "pill"
      ? tabWidth * tabCount + trayPadding * 2
      : Math.min(screenWidth - H_PADDING * 2, maxTrayWidth);

  const currentRouteName = state.routes[state.index]?.name;

  const activeTabIndex = tabs.findIndex((tab) => tab.name === currentRouteName);
  const lastValidIdx = useRef(activeTabIndex >= 0 ? activeTabIndex : 0);

  if (activeTabIndex >= 0) {
    lastValidIdx.current = activeTabIndex;
  }

  const pillTarget =
    activeTabIndex >= 0 ? activeTabIndex * tabWidth : lastValidIdx.current * tabWidth;

  const pillX = useRef(new Animated.Value(pillTarget)).current;

  useEffect(() => {
    if (mode !== "pill") return;

    Animated.spring(pillX, {
      toValue: pillTarget,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [mode, pillTarget, pillX]);

  const bottomPad = Math.max(insets.bottom, isLandscape ? 4 : 8);

  const trayShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: mode === "pill" ? 2 : 4 },
          shadowOpacity: 0.08,
          shadowRadius: mode === "pill" ? 10 : 12,
        }
      : { elevation: 6 };

  const pillShadow =
    Platform.OS === "ios"
      ? {
          shadowColor: activeColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.18,
          shadowRadius: 6,
        }
      : { elevation: 4 };

  const containerHorizontalPadding =
    mode === "pill"
      ? {
          paddingLeft: Math.max(H_PADDING, insets.left),
          paddingRight: Math.max(H_PADDING, insets.right),
        }
      : {};

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: isLandscape && mode === "pill" ? 4 : 8,
        paddingBottom: bottomPad,
        alignItems: "center",
        ...containerHorizontalPadding,
      }}
    >
      <View
        style={[
          {
            width: trayWidth,
            minHeight: tabHeight + trayPadding * 2,
            borderRadius: trayRadius,
            backgroundColor: "#F3F4F6",
            padding: trayPadding,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          },
          trayShadow,
        ]}
      >
        {mode === "pill" && (
          <Animated.View
            style={[
              {
                position: "absolute",
                top: trayPadding,
                left: trayPadding,
                width: tabWidth - trayPadding * 2,
                height: tabHeight,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                transform: [{ translateX: pillX }],
              },
              pillShadow,
            ]}
          />
        )}

        {visibleRoutes.map((route: any, index: number) => {
          const cfg = tabs.find((tab) => tab.name === route.name);
          if (!cfg) return null;

          const isFocused =
            mode === "pill"
              ? activeTabIndex >= 0 && activeTabIndex === index
              : state.routes[state.index]?.key === route.key;

          const InactiveIcon = cfg.icon;
          const ActiveIcon = cfg.activeIcon ?? cfg.icon;
          const IconToRender = isFocused ? ActiveIcon : InactiveIcon;

          const targetPath = `/${routeGroup}/${route.name}`;
          const isCurrentlyOnPath =
            pathname === targetPath || pathname?.startsWith(`${targetPath}/`);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) return;

            if (mode === "pill") {
              if (!isFocused && !isCurrentlyOnPath) {
                router.replace(targetPath as RelativePathString);
              }
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: route.name }],
              });
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
              accessibilityLabel={cfg.title}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                width: tabWidth,
                height: tabHeight,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: mode === "pill" ? 16 : 18,
                backgroundColor: "transparent",
                zIndex: 1,
              }}
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  gap: mode === "pill" ? (isSmallDevice ? 2 : 3) : 3,
                }}
              >
                <IconToRender
                  size={iconSize}
                  color={isFocused ? activeColor : inactiveColor}
                  strokeWidth={isFocused ? (mode === "pill" ? 2.2 : 2.4) : 1.8}
                />

                <Text
                  numberOfLines={1}
                  style={{
                    fontSize,
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight:
                      mode === "pill"
                        ? Platform.OS === "ios"
                          ? "600"
                          : "bold"
                        : isFocused
                          ? "700"
                          : "600",
                    letterSpacing: mode === "pill" ? 0.2 : 0,
                  }}
                >
                  {cfg.title}
                </Text>
              </View>
            </PlatformPressable>
          );
        })}
      </View>
    </View>
  );
}