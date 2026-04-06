export type HeaderVariant = "admin" | "user";

export type HeaderProfileMenuProps = {
  open: boolean;
  onClose: () => void;
  onProfilePress: () => void;
  onLogoutPress: () => void;
  top?: number;
  right?: number;
  width?: number;
};

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
