import { create } from "twrnc";
import { colors } from "./colors";
import { fontSizeConfig } from "./typography";

const neutral = {
  50: colors.canvas,
  100: colors.surfaceMuted,
  200: colors.border,
  300: colors.borderStrong,
  400: colors.subtle,
  500: colors.subtle,
  600: colors.muted,
  700: colors.muted,
  800: colors.ink,
  900: colors.ink,
  950: colors.ink,
};
const success = {
  50: colors.successSoft, 100: colors.successSoft, 200: colors.successBorder,
  400: colors.successBright, 500: colors.success, 600: colors.success,
  700: colors.successText, 800: colors.successText,
};
const warning = {
  50: colors.warningSoft, 100: colors.warningSoft, 200: colors.warningBorder,
  300: colors.accent, 400: colors.accent, 500: colors.warning,
  600: colors.warning, 700: colors.warningText, 800: colors.warningText,
  950: colors.warningText,
};

// Preserve existing utilities while resolving their colors from global.css.
export default create({
  theme: {
    extend: {
      fontSize: fontSizeConfig,
      colors: {
        ...colors,
        white: colors.surface,
        black: colors.shadow,
        gray: neutral,
        slate: neutral,
        blue: {
          50: colors.primarySoft, 100: colors.primarySoft, 200: colors.primaryBorder,
          400: colors.primaryMuted, 500: colors.primary, 600: colors.primary,
          700: colors.primaryPressed,
        },
        green: success,
        emerald: success,
        amber: warning,
        yellow: warning,
        red: {
          50: colors.dangerSoft, 100: colors.dangerSoft, 200: colors.dangerBorder,
          400: colors.danger, 500: colors.danger, 600: colors.danger,
          700: colors.dangerText, 800: colors.dangerText,
        },
        rose: { 50: colors.dangerSoft, 700: colors.dangerText },
        orange: {
          50: colors.orangeSoft, 200: colors.orangeBorder,
          700: colors.orangeText, 900: colors.orangeText,
        },
      },
    },
  },
});
