import UploadAvatar from "@/src/screens/profileImage";
import { colors } from "@/theme/colors";
import { typography } from "@/theme/typography";
import { Building2, Camera, Fingerprint, Trash2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  fullName: string;
  role?: string | null;
  organizationName?: string;
  avatarUrl: string | null;
  onAvatarUpload: (url: string) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
};

export default function ProfileHero({ fullName, role, organizationName, avatarUrl, onAvatarUpload, onAvatarRemove }: Props) {
  return (
    <View style={styles.card}>
      <View pointerEvents="none" accessible={false} style={styles.artwork}>
        <View style={styles.orbitOuter} />
        <View style={styles.orbitInner} />
        <View style={styles.greenPanel} />
      </View>
      <View style={styles.topRow}>
        <View style={styles.eyebrowRow}>
          <Fingerprint size={18} color={colors.onPrimarySoft} />
          <Text style={styles.eyebrow}>WORKSPACE PROFILE</Text>
        </View>
        <View style={styles.roleBadge}>
          <Text style={styles.role}>{role || "Member"}</Text>
        </View>
      </View>

      <View style={styles.identity}>
        <View style={styles.avatarRing}>
          <UploadAvatar size={92} imageUrl={avatarUrl} onUploadComplete={onAvatarUpload} />
          <View pointerEvents="none" style={styles.cameraBadge}>
            <Camera size={17} color={colors.primary} />
          </View>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.kicker}>YOUR ACCOUNT</Text>
          <Text accessibilityRole="header" style={styles.name}>{fullName || "Your profile"}</Text>
          <Text style={styles.photoHint}>Tap your photo to change it</Text>
        </View>
      </View>

      <View style={styles.workspace}>
        <View style={styles.workspaceIcon}><Building2 size={20} color={colors.surface} /></View>
        <View style={styles.workspaceText}>
          <Text style={styles.kicker}>ORGANIZATION</Text>
          <Text style={styles.organization}>{organizationName || "Not provided"}</Text>
        </View>
      </View>
      {avatarUrl && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Remove profile photo"
          onPress={onAvatarRemove}
          style={({ pressed }) => [styles.removePhoto, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Trash2 size={15} color={colors.onPrimarySoft} />
          <Text style={styles.removeLabel}>Remove photo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.ink, borderRadius: 28, padding: 22, gap: 26, overflow: "hidden" },
  artwork: { ...StyleSheet.absoluteFill, overflow: "hidden", borderRadius: 28 },
  orbitOuter: { position: "absolute", width: 290, height: 290, borderRadius: 145, borderWidth: 1, borderColor: colors.onPrimaryBorderSoft, right: -115, top: -130 },
  orbitInner: { position: "absolute", width: 230, height: 230, borderRadius: 115, borderWidth: 1, borderColor: colors.onPrimaryBorderSoft, right: -85, top: -100 },
  greenPanel: { position: "absolute", width: 220, height: 300, backgroundColor: colors.primary, opacity: 0.35, right: -145, bottom: -130, transform: [{ rotate: "35deg" }], borderRadius: 40 },
  topRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrow: { ...typography.caption, color: colors.onPrimarySoft, fontWeight: "600", letterSpacing: 1.3 },
  roleBadge: { borderWidth: 1, borderColor: colors.onPrimaryBorder, backgroundColor: colors.onPrimaryWash, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, maxWidth: "100%" },
  role: { ...typography.caption, fontWeight: "600", color: colors.surface, textTransform: "capitalize" },
  identity: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 18 },
  avatarRing: { padding: 5, borderWidth: 1, borderColor: colors.onPrimaryBorder, borderRadius: 999, backgroundColor: colors.onPrimaryWash },
  cameraBadge: { position: "absolute", bottom: 2, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 3, borderColor: colors.ink },
  nameBlock: { flexGrow: 1, flexBasis: 130, gap: 5 },
  kicker: { ...typography.caption, color: colors.onPrimarySoft, letterSpacing: 1.4, fontWeight: "600" },
  name: { ...typography.pageTitle, color: colors.surface, letterSpacing: -0.8 },
  photoHint: { ...typography.caption, color: colors.onPrimarySoft },
  workspace: { flexDirection: "row", alignItems: "center", gap: 12, borderTopWidth: 1, borderTopColor: colors.onPrimaryBorderSoft, paddingTop: 20 },
  workspaceIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.onPrimaryWash, alignItems: "center", justifyContent: "center" },
  workspaceText: { flex: 1, gap: 4 },
  organization: { ...typography.body, color: colors.surface, fontWeight: "600" },
  removePhoto: { alignSelf: "flex-start", flexDirection: "row", gap: 7, alignItems: "center", minHeight: 48, marginTop: -14 },
  removeLabel: { ...typography.caption, color: colors.onPrimarySoft },
});
