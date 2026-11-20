import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { ChevronRight, LockKeyhole } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  icon: ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
  locked?: boolean;
};

export default function InfoRow({ icon, label, value, onPress, isLast, locked }: Props) {
  const content = (
    <>
      <View style={styles.icon}>{icon}</View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} selectable={!onPress}>{value || "Not provided"}</Text>
      </View>
      {locked ? <LockKeyhole size={15} color={colors.subtle} /> : onPress ? <ChevronRight size={18} color={colors.subtle} /> : null}
    </>
  );
  const rowStyle = [styles.row, !isLast && styles.divider];

  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${label.toLowerCase()}: ${value || "not provided"}`} onPress={onPress} style={({ pressed }) => [rowStyle, pressed && styles.pressed]}>
      {content}
    </Pressable>
  ) : <View style={rowStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14, minHeight: 82 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  content: { flex: 1, gap: 4 },
  label: { ...typography.caption, fontWeight: "600", color: colors.muted },
  value: { ...typography.body, fontWeight: "600", color: colors.ink },
  pressed: { backgroundColor: colors.surfaceMuted },
});
