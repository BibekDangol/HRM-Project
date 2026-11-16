import { colors } from "@/theme/colors";
import { LogOut, UserCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  getDropdownPosition,
  type AnchorLayout,
} from "../common/getDropdownPosition";

type Props = {
  open: boolean;
  anchorLayout: AnchorLayout | null;
  onClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
  width?: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const MENU_HEIGHT = 105;
const ANDROID_HEADER_PUSH_DOWN = Platform.OS === "android" ? 10 : 0;

const HeaderProfileMenu: React.FC<Props> = ({
  open,
  anchorLayout,
  onClose,
  onProfilePress,
  onLogoutPress,
  width = 140,
}) => {
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-8));
  const [scale] = useState(() => new Animated.Value(0.96));

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

  if (!open) return null;

  const safeAnchorLayout: AnchorLayout =
    anchorLayout && anchorLayout.width > 0 && anchorLayout.height > 0
      ? anchorLayout
      : {
          pageX: SCREEN_WIDTH - width - 16,
          pageY: insets.top + 50,
          width: 36,
          height: 36,
        };

  const menuPosition = getDropdownPosition({
    anchorLayout: safeAnchorLayout,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    menuWidth: width,
    menuHeight: MENU_HEIGHT,
    insets,
    align: "right",
    gap: 8,
    sidePadding: 12,
  });

  const finalTop = menuPosition.top + ANDROID_HEADER_PUSH_DOWN;

  return (
    <Modal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent={false}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1 }}>
          <TouchableWithoutFeedback>
            <View
              style={{
                position: "absolute",
                top: finalTop,
                left: menuPosition.left,
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
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingVertical: 4,
                    paddingHorizontal: 6,
                    shadowColor: colors.shadow,
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
                    android_ripple={{ color: colors.border }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <UserCircle size={18} color={colors.ink} />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.ink,
                      }}
                    >
                      Profile
                    </Text>
                  </Pressable>

                  {/* Divider */}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.border,
                      marginHorizontal: 10,
                    }}
                  />

                  {/* Logout */}
                  <Pressable
                    onPress={() => {
                      onClose();
                      onLogoutPress();
                    }}
                    android_ripple={{ color: colors.dangerSoft }}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 12,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    <LogOut size={18} color={colors.danger} />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.danger,
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
