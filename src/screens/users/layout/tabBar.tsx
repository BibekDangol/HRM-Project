import { PlatformPressable } from "@react-navigation/elements";
import { useLinkBuilder } from "@react-navigation/native";
import { CalendarDays, House, LucideIcon, Menu } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ─── Theme ─────────────────────────────────────────────── */
const ACTIVE_COLOR = "#1b4a5a";
const INACTIVE_COLOR = "#9CA3AF";
const PILL_H = 56; // taller to fit icon + label stacked
const H_PADDING = 16;

/* ─── Tab config ─────────────────────────────────────────── */
type TabCfg = { icon: LucideIcon; label: string };

const tabConfig: Record<string, TabCfg> = {
  dashboard: { icon: House, label: "Home" },
  leaves: { icon: CalendarDays, label: "Leaves" },
  more: { icon: Menu, label: "More" },
};

/* ─── Component ──────────────────────────────────────────── */
export function MyTabBar({ state, descriptors, navigation }: any) {
  const { buildHref } = useLinkBuilder();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((route: any) => {
    const options = descriptors[route.key]?.options;
    return options?.href !== null && !!tabConfig[route.name];
  });

  const tabCount = visibleRoutes.length;
  const screenW = Dimensions.get("window").width;
  const innerW = screenW - H_PADDING * 2;
  const tabW = innerW / tabCount;

  /* ── Pill position animation ── */
  const focusedIdx = visibleRoutes.findIndex(
    (r: any) => r.key === state.routes[state.index]?.key,
  );

  const pillX = useRef(new Animated.Value(focusedIdx * tabW)).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: focusedIdx * tabW,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [focusedIdx, tabW]);

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
      }}
    >
      {/* ── Pill tray ── */}
      <View
        style={[
          {
            flexDirection: "row",
            backgroundColor: "#F3F4F6",
            borderRadius: 20,
            padding: 4,
            position: "relative",
            height: PILL_H + 8,
          },
          trayShadow,
        ]}
      >
        {/* Sliding white pill */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 4,
              left: 4,
              width: tabW - 8,
              height: PILL_H,
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              transform: [{ translateX: pillX }],
            },
            pillShadow,
          ]}
        />

        {/* Tabs */}
        {visibleRoutes.map((route: any) => {
          const isFocused = state.routes[state.index]?.key === route.key;

          const cfg = tabConfig[route.name];
          const Icon = cfg.icon;

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

          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

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
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column", // ← stacked layout
                gap: 3,
                zIndex: 1,
                height: PILL_H,
              }}
            >
              <Icon
                size={20}
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
