import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { RelativePathString, usePathname, useRouter } from "expo-router";
import React, { useRef, useEffect, useMemo } from "react";
import {
  Animated,
  Platform,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
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
  activePillColor?: string;
  closeAllOverlays?: () => void;
};

// ─── Single animated tab item ──────────────────────────────────────────────
function TabItem({
  route,
  cfg,
  isFocused,
  tabWidth,
  iconSize,
  fontSize,
  activeColor,
  inactiveColor,
  activePillColor,
  onPress,
  onLongPress,
  buildHref,
}: {
  route: any;
  cfg: TabBarItemConfig;
  isFocused: boolean;
  tabWidth: number;
  iconSize: number;
  fontSize: number;
  activeColor: string;
  inactiveColor: string;
  activePillColor: string;
  onPress: () => void;
  onLongPress: () => void;
  buildHref: (name: string, params?: object) => string | undefined;
}) {
  const pillAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const iconAnim = useRef(new Animated.Value(isFocused ? 1 : 0.88)).current;
  const labelAnim = useRef(new Animated.Value(isFocused ? 1 : 0.55)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(pillAnim, {
        toValue: isFocused ? 1 : 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 260,
        mass: 0.7,
      }),
      Animated.spring(iconAnim, {
        toValue: isFocused ? 1 : 0.88,
        useNativeDriver: true,
        damping: 18,
        stiffness: 240,
        mass: 0.7,
      }),
      Animated.timing(labelAnim, {
        toValue: isFocused ? 1 : 0.55,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const IconToRender = isFocused ? (cfg.activeIcon ?? cfg.icon) : cfg.icon;
  const iconColor = isFocused ? activeColor : inactiveColor;
  const badge = (cfg as any).badge as number | string | undefined;

  return (
    <PlatformPressable
      href={buildHref(route.name, route.params)}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={cfg.title}
      onPress={onPress}
      onLongPress={onLongPress}
      style={{ width: tabWidth, alignItems: "center", justifyContent: "center" }}
    >
      {/* Icon row with animated pill behind it */}
      <View style={styles.iconArea}>
        <Animated.View
          style={[
            styles.pill,
            {
              backgroundColor: activePillColor,
              borderRadius: 20,
              shadowColor: "#1B4A5A",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              opacity: pillAnim,
              transform: [
                {
                  scaleX: pillAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            },
          ]}
        />

        <Animated.View style={{ transform: [{ scale: iconAnim }] }}>
          <IconToRender
            size={iconSize}
            color={iconColor}
            strokeWidth={isFocused ? 2.1 : 1.75}
          />
        </Animated.View>

        {badge != null && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {typeof badge === "number" && badge > 99 ? "99+" : badge}
            </Text>
          </View>
        )}
      </View>

      {/* Label */}
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.label,
          {
            fontSize,
            color: iconColor,
            opacity: labelAnim,
            fontWeight: isFocused
              ? Platform.OS === "ios"
                ? "600"
                : "bold"
              : "500",
          },
        ]}
      >
        {cfg.title}
      </Animated.Text>
    </PlatformPressable>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function BaseTabBar({
  state,
  descriptors,
  navigation,
  tabs,
  mode,
  routeGroup,
  activeColor = "#1B4A5A",
  inactiveColor = "#8A94A6",
  activePillColor = "#E4EFF2",
  closeAllOverlays,
}: Props) {
  const { buildHref } = useLinkBuilder();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;

  const tabHeight = isTablet ? 58 : isSmallDevice ? 50 : 54;
  const iconSize = isTablet ? 26 : isSmallDevice ? 20 : 23;
  const fontSize = isTablet ? 13 : isSmallDevice ? 10 : 11;

  const visibleRoutes = useMemo(
    () =>
      state.routes.filter((route: any) => {
        const options = descriptors?.[route.key]?.options;
        return (
          options?.href !== null &&
          tabs.some((tab) => tab.name === route.name)
        );
      }),
    [state.routes, descriptors, tabs]
  );

  const tabWidth = screenWidth / Math.max(visibleRoutes.length, 1);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.separator} />

      <View style={{ flexDirection: "row", height: tabHeight }}>
        {visibleRoutes.map((route: any) => {
          const cfg = tabs.find((t) => t.name === route.name);
          if (!cfg) return null;

          const isFocused = state.routes[state.index]?.key === route.key;

          const targetPath = `/${routeGroup}/${route.name}`;
          const isCurrentlyOnPath =
            pathname === targetPath ||
            pathname?.startsWith(`${targetPath}/`);

          const handleNavigate = () => {
            if (mode === "pill") {
              if (!isFocused && !isCurrentlyOnPath)
                router.replace(targetPath as RelativePathString);
            } else {
              if (!isFocused)
                navigation.reset({
                  index: 0,
                  routes: [{ name: route.name }],
                });
            }
          };

          const onPress = () => {
            closeAllOverlays?.();
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (event.defaultPrevented) return;
            setTimeout(handleNavigate, 0);
          };

          const onLongPress = () =>
            navigation.emit({ type: "tabLongPress", target: route.key });

          return (
            <TabItem
              key={route.key}
              route={route}
              cfg={cfg}
              isFocused={isFocused}
              tabWidth={tabWidth}
              iconSize={iconSize}
              fontSize={fontSize}
              activeColor={activeColor}
              inactiveColor={inactiveColor}
              activePillColor={activePillColor}
              onPress={onPress}
              onLongPress={onLongPress}
              buildHref={buildHref}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.97)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 8 },
    }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  iconArea: {
    width: 52,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  label: {
    marginTop: 2,
    letterSpacing: 0.1,
  },
});