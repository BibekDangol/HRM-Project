import type { UserProfile } from "@/src/types/admin";
import { colors } from "@/theme/colors";
import { Pencil, Trash2, Users } from "lucide-react-native";
import { Image } from "expo-image";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onDelete: (id: string) => void;
  getSupervisorName: (id: string | null) => string;
};

export default function ManageUserCard({ user, onEdit, onDelete, getSupervisorName }: Props) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unnamed employee";
  const active = user.status === "active";
  const statusColor = active ? colors.primary : colors.warningText;
  return (
    <View style={styles.card}>
      <View style={styles.identity}>
        {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" accessibilityLabel={`${name} avatar`} /> : <View style={[styles.avatar, styles.initials]}><Text style={styles.initialsText}>{`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "?"}</Text></View>}
        <View style={styles.person}><Text style={styles.name}>{name}</Text><Text selectable style={styles.email} numberOfLines={1}>{user.email || "No email address"}</Text></View>
        <View style={[styles.status, { backgroundColor: active ? colors.primarySoft : colors.warningSoft }]}><View style={[styles.dot, { backgroundColor: statusColor }]} /><Text style={[styles.statusText, { color: statusColor }]}>{active ? "Active" : "Pending"}</Text></View>
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>ROLE</Text><Text style={styles.detailValue}>{user.role}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>SUPERVISOR</Text><View style={styles.supervisor}><Users size={14} color={colors.subtle} /><Text style={styles.supervisorName}>{getSupervisorName(user.supervisor_id)}</Text></View></View>
      </View>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${name}`} onPress={() => Alert.alert("Delete user", `Do you want to delete ${name}?`, [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => onDelete(user.id) }])} style={({ pressed }) => [styles.button, styles.delete, { opacity: pressed ? 0.6 : 1 }]}><Trash2 size={15} color={colors.dangerText} /><Text style={styles.deleteText}>Delete</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${name}`} onPress={() => onEdit(user)} style={({ pressed }) => [styles.button, styles.edit, { backgroundColor: pressed ? colors.primaryPressed : colors.primary }]}><Pencil size={15} color={colors.surface} /><Text style={styles.editText}>Edit</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, gap: 14, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, boxShadow: "0 4px 12px rgba(23,23,23,0.04)" },
  identity: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  initials: { alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primaryBorder },
  initialsText: { fontSize: 16, lineHeight: 22, fontWeight: "700", color: colors.primary },
  person: { flex: 1, minWidth: 100, gap: 4 },
  name: { fontSize: 17, lineHeight: 23, fontWeight: "700", letterSpacing: -0.3, color: colors.ink },
  email: { fontSize: 12, lineHeight: 18, color: colors.muted },
  status: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 10, lineHeight: 14, fontWeight: "600" },
  details: { backgroundColor: colors.surfaceMuted, borderRadius: 12, padding: 12, gap: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  detailLabel: { fontSize: 10, lineHeight: 15, letterSpacing: 0.6, color: colors.subtle, fontWeight: "600" },
  detailValue: { flex: 1, textAlign: "right", textTransform: "capitalize", fontSize: 13, lineHeight: 19, fontWeight: "600", color: colors.ink },
  supervisor: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 5 },
  supervisorName: { flexShrink: 1, textAlign: "right", fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.ink },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  button: { minHeight: 48, paddingHorizontal: 16, borderRadius: 12, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 },
  delete: { borderWidth: 1, borderColor: colors.border },
  deleteText: { color: colors.dangerText, fontSize: 12, lineHeight: 18, fontWeight: "600" },
  edit: { minWidth: 88 },
  editText: { color: colors.surface, fontSize: 12, lineHeight: 18, fontWeight: "600" },
});
