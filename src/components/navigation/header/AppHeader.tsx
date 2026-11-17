import { fontSizes, lineHeights, typography } from "@/theme/typography";
import { colors } from "@/theme/colors";
import { BackButton } from "@/src/components/BackButton";
import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
import { ChevronLeft, CircleCheck, LogOut, User, UserCircle } from "lucide-react-native";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
  useAnimatedValue,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { getDropdownPosition, type AnchorLayout } from "../common/getDropdownPosition";

export const HomeScreenHeaderContext = createContext<React.ReactNode>(null);

export function HomeScreenHeader() {
  return useContext(HomeScreenHeaderContext);
}

export function AppScreenLayout({
  isHome,
  insetBottom = false,
  onBack,
  homeContent,
  backgroundColor = colors.canvas,
  children,
}: {
  isHome: boolean;
  insetBottom?: boolean;
  onBack?: () => void;
  homeContent?: React.ReactNode;
  backgroundColor?: string;
  children: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={insetBottom ? ["top", "left", "right", "bottom"] : ["top", "left", "right"]} style={{ flex: 1, backgroundColor }}>
      {isHome ? homeContent : onBack ? (
        <View style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
          <BackButton onPress={onBack} color={backgroundColor === colors.primary ? colors.surface : colors.primary} />
        </View>
      ) : null}
      {children}
    </SafeAreaView>
  );
}

export function HomePageIntro({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={typography.description}>Welcome back</Text>
        <Text accessibilityRole="header" style={typography.pageTitle}>{name}</Text>
      </View>
      {children}
    </View>
  );
}

export type HeaderVariant = "admin" | "user";

export type HeaderProfileButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  size?: number;
};

export type AppHeaderLeftProps = {
  visible?: boolean;
  onPress: () => void;
};

export type AppHeaderRightProps = {
  variant: HeaderVariant;
  isLocked?: boolean;
  profileMenuOpen: boolean;
  onProfileTrigger: () => void;
  onProfileClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
  profileButtonSize?: number;
  children?: React.ReactNode;
};

export const AppHeaderLeft: React.FC<AppHeaderLeftProps> = ({
  visible = true,
  onPress,
}) => {
  if (!visible) return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        marginLeft: 12,
        padding: 6,
        minHeight: 48,
        minWidth: 48,
        justifyContent: "center",
        alignItems: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <ChevronLeft size={26} color={colors.surface} />
    </Pressable>
  );
};

const HeaderProfileButton: React.FC<HeaderProfileButtonProps> = ({
  onPress,
  disabled = false,
  size = 36,
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open profile menu"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => ({
        height: Math.max(size, 48),
        width: Math.max(size, 48),
        borderRadius: Math.max(size, 48) / 2,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.55 : pressed ? 0.75 : 1,
      })}
    >
      <User size={20} color={colors.ink} />
    </Pressable>
  );
};

type HeaderProfileMenuProps = {
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

const HeaderProfileMenu: React.FC<HeaderProfileMenuProps> = ({
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
                        fontSize: fontSizes.body, lineHeight: lineHeights.body,
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
                        fontSize: fontSizes.body, lineHeight: lineHeights.body,
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

export const AppHeaderRight: React.FC<AppHeaderRightProps> = ({
  isLocked = false,
  profileMenuOpen,
  onProfileTrigger,
  onProfileClose,
  onProfilePress,
  onLogoutPress,
  profileButtonSize = 36,
  children,
}) => {
  const btnRef = useRef<View>(null);
  const [anchorLayout, setAnchorLayout] = useState<AnchorLayout | null>(null);

  const measure = useCallback((callback?: () => void) => {
    requestAnimationFrame(() => {
      btnRef.current?.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setAnchorLayout({
            pageX: x,
            pageY: y,
            width,
            height,
          });
        }

        callback?.();
      });
    });
  }, []);

  const handleProfileTrigger = () => {
    if (isLocked) return;

    measure(() => {
      onProfileTrigger();
    });
  };

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {children}

      <View ref={btnRef} collapsable={false} onLayout={() => measure()}>
        <HeaderProfileButton
          disabled={isLocked}
          onPress={handleProfileTrigger}
          size={profileButtonSize}
        />
      </View>

      <HeaderProfileMenu
        open={profileMenuOpen}
        anchorLayout={anchorLayout}
        onClose={onProfileClose}
        onProfilePress={onProfilePress}
        onLogoutPress={onLogoutPress}
        width={140}
      />
    </View>
  );
};

const CHECK_MENU_WIDTH = 150;

const CHECK_MENU_HEIGHT_CHECKED_OUT = 72;

const CHECK_MENU_HEIGHT_CHECKED_IN = 118;

const DEFAULT_LAYOUT: AnchorLayout = {
  pageX: 0,
  pageY: 0,
  width: 0,
  height: 0,
};

type HeaderCheckMenuProps = {
  isLocked: boolean;
  isCheckedIn: boolean;
  isOpen: boolean;
  checkedInAt: Date | null;
  elapsedMs: number;
  onTriggerPress: () => void;
  onTogglePress: () => void;
};

const AnimatedDropdown: React.FC<{
  visible: boolean;
  children: React.ReactNode;
}> = ({ visible, children }) => {
  const opacity = useAnimatedValue(0);
  const translateY = useAnimatedValue(-8);
  const scale = useAnimatedValue(0.96);

  useEffect(() => {
    if (visible) {
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
  }, [visible, opacity, scale, translateY]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export const HeaderCheckMenu: React.FC<HeaderCheckMenuProps> = ({
  isLocked,
  isCheckedIn,
  isOpen,
  checkedInAt,
  elapsedMs,
  onTriggerPress,
  onTogglePress,
}) => {
  const btnRef = useRef<View>(null);
  const insets = useSafeAreaInsets();

  const [layout, setLayout] = useState<AnchorLayout>(DEFAULT_LAYOUT);

  const measure = (callback?: () => void) => {
    requestAnimationFrame(() => {
      btnRef.current?.measureInWindow((x, y, width, height) => {
        if (!width || !height) return;

        setLayout({
          pageX: x,
          pageY: y,
          width,
          height,
        });

        callback?.();
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      measure();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      measure();
    }
  }, [isOpen]);

  const hasValidLayout = layout.width > 0 && layout.height > 0;

  const estimatedMenuHeight = isCheckedIn
    ? CHECK_MENU_HEIGHT_CHECKED_IN
    : CHECK_MENU_HEIGHT_CHECKED_OUT;

  const menuPosition = getDropdownPosition({
    anchorLayout: layout,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    menuWidth: CHECK_MENU_WIDTH,
    menuHeight: estimatedMenuHeight,
    insets: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    },
    align: "center",
    gap: 8,
    sidePadding: 12,
  });

  const finalTop = menuPosition.top + ANDROID_HEADER_PUSH_DOWN;

  const handleTriggerPress = () => {
    if (isLocked) return;

    measure(() => {
      onTriggerPress();
    });
  };

  return (
    <View>
      <View ref={btnRef} collapsable={false}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isCheckedIn ? "Attendance: currently working" : "Attendance: checked out"}
          accessibilityHint="Opens attendance actions"
          accessibilityState={{ disabled: isLocked, expanded: isOpen }}
          aria-expanded={isOpen}
          disabled={isLocked}
          onPress={handleTriggerPress}
          hitSlop={10}
          style={({ pressed }) => ({
            height: 48,
            width: 48,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View
            style={{
              height: 12,
              width: 12,
              borderRadius: 6,
              backgroundColor: isCheckedIn ? colors.success : colors.danger,
            }}
          />
        </Pressable>
      </View>

      <Modal
        visible={isOpen && hasValidLayout}
        transparent
        animationType="none"
        statusBarTranslucent={false}
        onRequestClose={onTriggerPress}
      >
        <TouchableWithoutFeedback onPress={onTriggerPress}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: finalTop,
                  left: menuPosition.left,
                  width: CHECK_MENU_WIDTH,
                }}
              >
                <AnimatedDropdown visible={isOpen && hasValidLayout}>
                  <View
                    style={{
                      borderRadius: 24,
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                      padding: 10,
                      width: CHECK_MENU_WIDTH,
                      shadowColor: colors.shadow,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 10,
                      elevation: 10,
                    }}
                  >
                    {isCheckedIn ? (
                      <View style={{ alignItems: "center" }}>
                        <Text
                          style={{
                            fontSize: fontSizes.label, lineHeight: lineHeights.label,
                            color: colors.muted,
                            marginBottom: 2,
                          }}
                        >
                          Since {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                        </Text>

                        <Text
                          style={{
                            fontSize: fontSizes.body, lineHeight: lineHeights.body,
                            fontWeight: "700",
                            color: colors.ink,
                            marginBottom: 8,
                          }}
                        >
                          {formatElapsed(elapsedMs)}
                        </Text>

                        <Pressable
                          accessibilityRole="button"
                          disabled={isLocked}
                          onPress={onTogglePress}
                          style={({ pressed }) => ({
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            paddingVertical: 12,
                            minHeight: 48,
                            borderRadius: 12,
                            backgroundColor: colors.accent,
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <LogOut size={14} color={colors.ink} />
                          <Text
                            style={{
                              fontSize: fontSizes.label, lineHeight: lineHeights.label,
                              fontWeight: "600",
                              color: colors.ink,
                            }}
                          >
                            Check Out
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        disabled={isLocked}
                        onPress={onTogglePress}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          paddingVertical: 12,
                          minHeight: 48,
                          borderRadius: 12,
                          backgroundColor: colors.accent,
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <CircleCheck size={14} color={colors.ink} />
                        <Text
                          style={{
                            fontSize: fontSizes.label, lineHeight: lineHeights.label,
                            fontWeight: "600",
                            color: colors.ink,
                          }}
                        >
                          Check In
                        </Text>
                      </Pressable>
                    )}
                  </View>
                </AnimatedDropdown>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
