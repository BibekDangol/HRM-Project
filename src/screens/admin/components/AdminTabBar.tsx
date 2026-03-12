import { RelativePathString, usePathname, useRouter } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { adminTabs } from "../../../config/adminTabs";

const ACTIVE_COLOR = "#008080";
const INACTIVE_COLOR = "#9CA3AF";
const TRAY_PADDING = 4;
const PILL_RADIUS = 16;
const H_PADDING = 16;

export default function AdminTabBar({ state }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // ── Responsive values ────────────────────────────────────────────
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallDevice = screenWidth < 360;
  const isTablet = screenWidth >= 768;
  const isLandscape = screenWidth > screenHeight;

  const PILL_H = isTablet ? 60 : isSmallDevice || isLandscape ? 48 : 54;
  const ICON_SIZE = isTablet ? 26 : isSmallDevice ? 19 : 22;
  const FONT_SIZE = isTablet ? 13 : isSmallDevice ? 10 : 11;

  const maxTrayW = isTablet ? 520 : screenWidth;
  const sideInsets =
    Math.max(H_PADDING, insets.left) + Math.max(H_PADDING, insets.right);
  const availableW = Math.min(maxTrayW, screenWidth) - sideInsets;
  const tabCount = adminTabs.length;
  const TAB_W = Math.floor((availableW - TRAY_PADDING * 2) / tabCount);
  const trayW = TAB_W * tabCount + TRAY_PADDING * 2;
  // ─────────────────────────────────────────────────────────────────

  // ── Fix: determine active tab index safely ────────────────────────
  // state.index can point to a non-tab route (e.g. profile screen),
  // which causes the pill to fly off to the right.
  const activeRouteName = state.routes[state.index]?.name;
  const activeTabIdx = adminTabs.findIndex(
    (tab) => tab.name === activeRouteName,
  );
  // -1 when on a non-tab route like profile

  // Remember the last valid tab index so we can freeze the pill there
  const lastValidIdx = useRef(activeTabIdx >= 0 ? activeTabIdx : 0);
  if (activeTabIdx >= 0) {
    lastValidIdx.current = activeTabIdx;
  }

  // Pill target: use live index when on a tab, freeze at last tab when not
  const pillTarget =
    activeTabIdx >= 0 ? activeTabIdx * TAB_W : lastValidIdx.current * TAB_W; // ← frozen, no fly-off
  // ─────────────────────────────────────────────────────────────────

  const pillX = useRef(new Animated.Value(pillTarget)).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: pillTarget,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [pillTarget]);

  const bottomPad = Math.max(insets.bottom, isLandscape ? 4 : 8);

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
        paddingTop: isLandscape ? 4 : 8,
        paddingBottom: bottomPad,
        paddingLeft: Math.max(H_PADDING, insets.left),
        paddingRight: Math.max(H_PADDING, insets.right),
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

        {adminTabs.map((tab, index) => {
          // Tab is only "active" when we're actually on a tab route
          const isFocused = activeTabIdx >= 0 && activeTabIdx === index;
          const Icon = tab.icon as LucideIcon;
          const targetPath = `/(admin)/${tab.name}`;
          const isCurrentlyOnPath =
            pathname === targetPath || pathname?.startsWith(targetPath + "/");
          const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

          const handlePress = () => {
            if (!isFocused && !isCurrentlyOnPath) {
              router.replace(targetPath as RelativePathString);
            }
          };

          return (
            <Pressable
              key={tab.name}
              onPress={handlePress}
              style={{
                width: TAB_W,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: isSmallDevice ? 2 : 3,
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
                  fontSize: FONT_SIZE,
                  fontWeight: Platform.OS === "ios" ? "600" : "bold",
                  letterSpacing: 0.2,
                }}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
