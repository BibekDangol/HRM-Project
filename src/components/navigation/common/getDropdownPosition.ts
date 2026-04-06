export type AnchorLayout = {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

type Insets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Align = "left" | "center" | "right";

type GetDropdownPositionParams = {
  anchorLayout: AnchorLayout;
  screenWidth: number;
  screenHeight: number;
  menuWidth: number;
  menuHeight: number;
  insets: Insets;
  align?: Align;
  gap?: number;
  sidePadding?: number;
};

export function getDropdownPosition({
  anchorLayout,
  screenWidth,
  screenHeight,
  menuWidth,
  menuHeight,
  insets,
  align = "center",
  gap = 8,
  sidePadding = 12,
}: GetDropdownPositionParams) {
  let left = anchorLayout.pageX;

  if (align === "center") {
    left = anchorLayout.pageX + anchorLayout.width / 2 - menuWidth / 2;
  } else if (align === "right") {
    left = anchorLayout.pageX + anchorLayout.width - menuWidth;
  }

  const minLeft = insets.left + sidePadding;
  const maxLeft = screenWidth - menuWidth - insets.right - sidePadding;

  left = Math.max(minLeft, Math.min(left, maxLeft));

  const spaceBelow =
    screenHeight -
    (anchorLayout.pageY + anchorLayout.height) -
    insets.bottom -
    sidePadding;

  const spaceAbove = anchorLayout.pageY - insets.top - sidePadding;

  const openBelow = spaceBelow >= menuHeight || spaceBelow >= spaceAbove;

  let top = openBelow
    ? anchorLayout.pageY + anchorLayout.height + gap
    : anchorLayout.pageY - menuHeight - gap;

  const minTop = insets.top + sidePadding;
  const maxTop = screenHeight - menuHeight - insets.bottom - sidePadding;

  top = Math.max(minTop, Math.min(top, maxTop));

  return { top, left, openBelow };
}