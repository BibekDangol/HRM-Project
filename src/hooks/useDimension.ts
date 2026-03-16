import { useWindowDimensions } from "react-native";

export function useDimension() {
  const { width, height, scale, fontScale } = useWindowDimensions();

  const isSmallPhone = width < 360;
  const isPhone = width < 768;
  const isTablet = width >= 768;

  return {
    width,
    height,
    scale,
    fontScale,
    isSmallPhone,
    isPhone,
    isTablet,
  };
}
