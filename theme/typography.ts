import type { TextStyle } from "react-native";
import { colors } from "./colors";

export const fontSizes = { caption: 12, label: 14, body: 16, section: 20, page: 28, metric: 32 } as const;
export const lineHeights = { caption: 18, label: 20, body: 24, section: 28, page: 36, metric: 40 } as const;

export const typography = {
  pageTitle: { fontSize: fontSizes.page, lineHeight: lineHeights.page, fontWeight: "700", color: colors.ink },
  sectionTitle: { fontSize: fontSizes.section, lineHeight: lineHeights.section, fontWeight: "600", color: colors.ink },
  cardTitle: { fontSize: fontSizes.body, lineHeight: lineHeights.body, fontWeight: "600", color: colors.ink },
  body: { fontSize: fontSizes.body, lineHeight: lineHeights.body, color: colors.ink },
  subtitle: { fontSize: fontSizes.body, lineHeight: lineHeights.body, color: colors.muted },
  description: { fontSize: fontSizes.label, lineHeight: lineHeights.label, color: colors.muted },
  caption: { fontSize: fontSizes.caption, lineHeight: lineHeights.caption, color: colors.subtle },
  label: { fontSize: fontSizes.label, lineHeight: lineHeights.label, fontWeight: "600", color: colors.ink },
  input: { fontSize: fontSizes.body, lineHeight: lineHeights.body, color: colors.ink },
  button: { fontSize: fontSizes.body, lineHeight: lineHeights.body, fontWeight: "600" },
  link: { fontSize: fontSizes.label, lineHeight: lineHeights.label, fontWeight: "600", color: colors.primary },
  metric: { fontSize: fontSizes.metric, lineHeight: lineHeights.metric, fontWeight: "700", color: colors.ink },
} satisfies Record<string, TextStyle>;

const metric = (size: number, height: number): [string, { lineHeight: string }] =>
  [`${size}px`, { lineHeight: `${height}px` }];

// The same roles are available to existing twrnc components and native styles.
export const fontSizeConfig = {
  page: metric(fontSizes.page, lineHeights.page),
  section: metric(fontSizes.section, lineHeights.section),
  card: metric(fontSizes.body, lineHeights.body),
  body: metric(fontSizes.body, lineHeights.body),
  description: metric(fontSizes.label, lineHeights.label),
  caption: metric(fontSizes.caption, lineHeights.caption),
  label: metric(fontSizes.label, lineHeights.label),
  action: metric(fontSizes.body, lineHeights.body),
  input: metric(fontSizes.body, lineHeights.body),
  metric: metric(fontSizes.metric, lineHeights.metric),
};
