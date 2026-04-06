import { LogOut, UserCircle } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    Text,
    TouchableWithoutFeedback,
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
  }, [open, opacity, scale, translateY]);

  const hasValidLayout =
    !!anchorLayout && anchorLayout.width > 0 && anchorLayout.height > 0;

  if (!hasValidLayout || !anchorLayout) return null;

  const position = getDropdownPosition(anchorLayout, width);

  return (
    <Modal
      visible={open && hasValidLayout}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback>
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
                  <Pressable
                    onPress={onProfilePress}
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

                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#E5E7EB",
                      marginHorizontal: 10,
                    }}
                  />

                  <Pressable
                    onPress={onLogoutPress}
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
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default HeaderProfileMenu;
