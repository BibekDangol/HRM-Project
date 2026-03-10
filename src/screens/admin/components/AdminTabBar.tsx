import { RelativePathString, usePathname, useRouter } from "expo-router";
import { LucideIcon } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { adminTabs } from "../../../config/adminTabs";

const ACTIVE_COLOR = "#008080";
const INACTIVE_COLOR = "#9CA3AF";
const PILL_H = 56;
const H_PADDING = 16;
const TRAY_PADDING = 4;
const PILL_RADIUS = 16;
const ICON_SIZE = 22;
const TAB_W = 100; // fixed per tab

export default function AdminTabBar({ state }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabCount = adminTabs.length;
  const trayW = tabCount * TAB_W + TRAY_PADDING * 2;

  const focusedIdx = state.index;
  const pillX = useRef(new Animated.Value(focusedIdx * TAB_W)).current;

  useEffect(() => {
    Animated.spring(pillX, {
      toValue: focusedIdx * TAB_W,
      useNativeDriver: true,
      damping: 18,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [focusedIdx]);

  const bottomPad = insets.bottom > 0 ? insets.bottom : 16;

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
        alignItems: "center", // 👈 center the tray
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
            width: trayW, // 👈 exact fit
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
          const isFocused = state.index === index;
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
                width: TAB_W, // 👈 fixed width
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 3,
                zIndex: 1,
                height: PILL_H,
              }}
            >
              <Icon size={ICON_SIZE} color={color} strokeWidth={isFocused ? 2.2 : 1.8} />
              <Text
                numberOfLines={1}
                style={{
                  color,
                  fontSize: 11,
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