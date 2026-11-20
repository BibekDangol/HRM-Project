import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { Pencil } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  caption?: string;
  children: ReactNode;
  onRightPress?: () => void;
  rightText?: string;
};

export default function Section({ title, caption, children, onRightPress, rightText }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.heading}>
          {caption && <Text style={styles.caption}>{caption}</Text>}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        </View>
        {rightText && onRightPress && (
          <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${title.toLowerCase()}`} onPress={onRightPress} style={({ pressed }) => [styles.edit, { opacity: pressed ? 0.6 : 1 }]}>
            <Pencil size={15} color={colors.primary} />
            <Text style={typography.link}>{rightText}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 14 },
  header: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 },
  heading: { gap: 4, flexShrink: 1 },
  caption: { ...typography.caption, color: colors.primary, fontWeight: "700", letterSpacing: 1.6, textTransform: "uppercase" },
  title: { ...typography.sectionTitle, fontWeight: "700", letterSpacing: -0.4 },
  edit: { minHeight: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.primarySoft, flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: colors.surface, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: colors.border },
});
