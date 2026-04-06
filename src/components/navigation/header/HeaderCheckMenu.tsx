import { formatElapsed, formatSinceTime } from "@/src/utils/attendanceHelper";
import { CircleCheck, LogOut } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    Pressable,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";

import {
    getDropdownPosition,
    type AnchorLayout,
} from "../common/getDropdownPosition";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHECK_MENU_WIDTH = 150;

const DEFAULT_LAYOUT: AnchorLayout = {
  pageX: 0,
  pageY: 0,
  width: 0,
  height: 0,
};

type Props = {
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
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

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
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      {children}
    </Animated.View>
  );
};

const HeaderCheckMenu: React.FC<Props> = ({
  isLocked,
  isCheckedIn,
  isOpen,
  checkedInAt,
  elapsedMs,
  onTriggerPress,
  onTogglePress,
}) => {
  const btnRef = useRef<View>(null);
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

        // callback?.();
      });
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => measure(), 250);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      measure();
    }
  }, [isOpen]);

  const hasValidLayout = layout.width > 0 && layout.height > 0;

  const menuPosition = getDropdownPosition(
    layout,
    SCREEN_WIDTH,
    CHECK_MENU_WIDTH,
    "center",
  );

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
          disabled={isLocked}
          onPress={handleTriggerPress}
          hitSlop={10}
          style={({ pressed }) => ({
            height: 36,
            width: 36,
            borderRadius: 18,
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
              backgroundColor: isCheckedIn ? "#4ADE80" : "#FCA5A5",
            }}
          />
        </Pressable>
      </View>

      <Modal
        visible={isOpen && hasValidLayout}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={onTriggerPress}
      >
        <TouchableWithoutFeedback onPress={onTriggerPress}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View
                style={{
                  position: "absolute",
                  top: menuPosition.top,
                  left: menuPosition.left,
                  width: CHECK_MENU_WIDTH,
                }}
              >
                <AnimatedDropdown visible={isOpen && hasValidLayout}>
                  <View
                    style={{
                      borderRadius: 14,
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      padding: 10,
                      width: CHECK_MENU_WIDTH,
                      shadowColor: "#000",
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
                            fontSize: 11,
                            color: "#64748B",
                            marginBottom: 2,
                          }}
                        >
                          Since{" "}
                          {checkedInAt ? formatSinceTime(checkedInAt) : "--"}
                        </Text>

                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#0F172A",
                            marginBottom: 8,
                          }}
                        >
                          {formatElapsed(elapsedMs)}
                        </Text>

                        <Pressable
                          onPress={onTogglePress}
                          style={({ pressed }) => ({
                            width: "100%",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            paddingVertical: 8,
                            borderRadius: 10,
                            backgroundColor: "#FFB300",
                            opacity: pressed ? 0.8 : 1,
                          })}
                        >
                          <LogOut size={14} color="#1F2937" />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#1F2937",
                            }}
                          >
                            Check Out
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        onPress={onTogglePress}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: "#FFB300",
                          opacity: pressed ? 0.8 : 1,
                        })}
                      >
                        <CircleCheck size={14} color="#1F2937" />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: "#1F2937",
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

export default HeaderCheckMenu;
