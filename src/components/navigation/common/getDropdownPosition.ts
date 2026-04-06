type AnchorLayout = {
  pageX: number;
  pageY: number;
  width: number;
  height: number;
};

type AlignMode = "center" | "right";

const DEFAULT_SCREEN_PADDING = 12;
const DEFAULT_GAP = 8;
const HEADER_OFFSET = 20;

export function getDropdownPosition(
  anchor: AnchorLayout,
  screenWidth: number,
  menuWidth: number,
  align: AlignMode = "right",
) {
  const top = anchor.pageY + anchor.height + DEFAULT_GAP + HEADER_OFFSET;

  let left =
    align === "center"
      ? anchor.pageX + anchor.width / 2 - menuWidth / 2
      : anchor.pageX + anchor.width - menuWidth;

  left = Math.min(
    Math.max(left, DEFAULT_SCREEN_PADDING),
    screenWidth - menuWidth - DEFAULT_SCREEN_PADDING,
  );

  return { top, left };
}

export type { AnchorLayout, AlignMode };