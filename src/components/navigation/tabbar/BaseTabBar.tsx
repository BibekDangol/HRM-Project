import { colors } from "@/theme/colors";
import {
  PlatformPressable,
  useLinkBuilder,
} from "expo-router/react-navigation";
import { RelativePathString, usePathname, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Animated,
  Platform,
  Text,
  View,
  useWindowDimensions,
  useAnimatedValue,
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

function TabItem({
  route,
  cfg,
  isFocused,
  tabWidth,
  iconSize,
  fontSize,
  activeColor,
  inactiveColor,
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
  onPress: () => void;
  onLongPress: () => void;
  buildHref: (name: string, params?: object) => string | undefined;
}) {
  const scaleAnim = useAnimatedValue(isFocused ? 1 : 0.96);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0.96,
      useNativeDriver: true,
      damping: 16,
      stiffness: 220,
      mass: 0.8,
    }).start();
  }, [isFocused, scaleAnim]);

  const IconToRender = isFocused ? (cfg.activeIcon ?? cfg.icon) : cfg.icon;
  const iconColor = isFocused ? colors.surface : inactiveColor;
  const badge = (cfg as any).badge as number | string | undefined;

  return (
    <PlatformPressable
      href={buildHref(route.name, route.params)}
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={cfg.title}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.pressable, { width: tabWidth }]}
    >
      <Animated.View
        style={[
          styles.itemContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconArea}>
          <IconToRender
            size={iconSize}
            color={iconColor}
            strokeWidth={isFocused ? 2.2 : 1.9}
          />

          {badge != null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {typeof badge === "number" && badge > 99 ? "99+" : badge}
              </Text>
            </View>
          )}
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              fontSize,
              color: iconColor,
              fontWeight: isFocused
                ? Platform.OS === "ios"
                  ? "700"
                  : "bold"
                : "500",
            },
          ]}
        >
          {cfg.title}
        </Text>
      </Animated.View>
    </PlatformPressable>
  );
}

export default function BaseTabBar({
  state,
  descriptors,
  navigation,
  tabs,
  mode,
  routeGroup,
  activeColor = colors.surface,
  inactiveColor = colors.subtle,
  activePillColor = colors.primary,
  closeAllOverlays,
}: Props) {
  const { buildHref } = useLinkBuilder();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;

  const tabHeight = isTablet ? 64 : isSmallDevice ? 56 : 60;
  const iconSize = isTablet ? 25 : isSmallDevice ? 20 : 22;
  const fontSize = isTablet ? 14 : isSmallDevice ? 12 : 13;

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

  const routeCount = Math.max(visibleRoutes.length, 1);
  const tabWidth = screenWidth / routeCount;

  const indicatorWidth = Math.min(tabWidth - 24, 120);

  // FIX: Derive the pill position from the focused route's index within
  // visibleRoutes rather than using state.index directly. state.index is an
  // index into state.routes, which may contain hidden routes (href: null),
  // so it can diverge from the visible index and slide the pill to the wrong tab.
  const focusedVisibleIndex = useMemo(() => {
    const focusedKey = state.routes[state.index]?.key;
    const idx = visibleRoutes.findIndex((r: any) => r.key === focusedKey);
    return idx === -1 ? 0 : idx;
  }, [state.index, state.routes, visibleRoutes]);

  const translateX = useAnimatedValue(
    focusedVisibleIndex * tabWidth + (tabWidth - indicatorWidth) / 2
  );

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: focusedVisibleIndex * tabWidth + (tabWidth - indicatorWidth) / 2,
      useNativeDriver: true,
      damping: 18,
      stiffness: 220,
      mass: 0.85,
    }).start();
  }, [focusedVisibleIndex, tabWidth, indicatorWidth, translateX]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.separator} />

      <View style={[styles.tabRow, { height: tabHeight }]}>
        <Animated.View
          style={[
            styles.activePill,
            { pointerEvents: "none" },
            {
              width: indicatorWidth,
              height: 46,
              backgroundColor: activePillColor,
              transform: [{ translateX }],
            },
          ]}
        />

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
              if (!isFocused && !isCurrentlyOnPath) {
                router.replace(targetPath as RelativePathString);
              }
            } else {
              if (!isFocused) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: route.name }],
                });
              }
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
  },
  tabRow: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 7,
    left: 0,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pressable: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    zIndex: 2,
  },
  itemContent: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  iconArea: {
    minHeight: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -14,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 11,
    fontWeight: "700",
  },
  label: {
    letterSpacing: 0.1,
  },
});
