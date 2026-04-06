import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";

import HeaderProfileButton from "./HeaderProfileButton";
import HeaderProfileMenu from "./HeaderProfileMenu";
import { AppHeaderRightProps } from "./types";

type AnchorLayout = {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

const AppHeaderRight: React.FC<AppHeaderRightProps> = ({
  variant,
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
        if (!width || !height) return;

        setAnchorLayout({
          pageX: x,
          pageY: y,
          width,
          height,
        });

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
        marginRight: 16,
        marginBottom: variant === "user" ? 8 : 0,
      }}
    >
      {children}

      <View ref={btnRef} collapsable={false}>
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

export default AppHeaderRight;
