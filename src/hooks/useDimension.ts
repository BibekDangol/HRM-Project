import { useWindowDimensions } from 'react-native';

export function useDimension() {
  const { width, height, scale, fontScale } = useWindowDimensions();

  const isPhone = width < 768;
  const isTablet = width >= 768;

  return {
    width,
    height,
    scale,
    fontScale,
    isPhone,
    isTablet,
  };
}