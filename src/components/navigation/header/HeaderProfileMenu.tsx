import { LogOut, UserCircle } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  Text,
  View,
} from "react-native";

type AnchorLayout = {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

type Props = {
  open: boolean;
  anchorLayout: AnchorLayout | null;
  onClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
  width?: number;
};

const SCREEN = Dimensions.get("window");

function getDropdownPosition(anchor: AnchorLayout, menuWidth: number) {
  const top = anchor.pageY + anchor.height + 8 + 20;
  let left = anchor.pageX + anchor.width - menuWidth;

  left = Math.min(Math.max(left, 12), SCREEN.width - menuWidth - 12);

  return { top, left };
}

const HeaderProfileMenu: React.FC<Props> = ({
  open,
  anchorLayout,
  onClose,
  onProfilePress,
  onLogoutPress,
  width = 140,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 260,
          mass: 0.9,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          damping: 18,
          stiffness: 260,
          mass: 0.9,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.96,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -8,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  const hasValidLayout =
    !!anchorLayout && anchorLayout.width > 0 && anchorLayout.height > 0;

  if (!open || !hasValidLayout || !anchorLayout) return null;

  const position = getDropdownPosition(anchorLayout, width);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        pointerEvents: "box-none", // 🔑 allows tab clicks to pass through
      }}
    >
      {/* Background press (closes dropdown) */}
      <Pressable
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
        onPress={onClose}
      />

      {/* Dropdown */}
      <View
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          width,
        }}
      >
        <Animated.View
          style={{
            opacity,
            transform: [{ translateY }, { scale }],
          }}
        >
          <View
            style={{
              width,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              paddingVertical: 4,
              paddingHorizontal: 6,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {/* Profile */}
            <Pressable
              onPress={() => {
                onClose();
                onProfilePress();
              }}
              android_ripple={{ color: "#E5E7EB" }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <UserCircle size={18} color="#111827" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Profile
              </Text>
            </Pressable>

            {/* Divider */}
            <View
              style={{
                height: 1,
                backgroundColor: "#E5E7EB",
                marginHorizontal: 10,
              }}
            />

            {/* Logout */}
            <Pressable
              onPress={() => {
                onClose();
                onLogoutPress();
              }}
              android_ripple={{ color: "#FEE2E2" }}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                opacity: pressed ? 0.75 : 1,
              })}
            >
              <LogOut size={18} color="#EF4444" />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#EF4444",
                }}
              >
                Logout
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

export default HeaderProfileMenu;
