import { colors } from "@/theme/colors";
import { LockKeyhole, Mail, ShieldCheck, User } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import EditProfileModal from "@/src/components/profile/EditProfileModal";
import InfoRow from "@/src/components/profile/InfoRow";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import ProfileHero from "@/src/components/profile/ProfileHero";
import Section from "@/src/components/profile/Section";
import { typography } from "@/theme/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useProfile } from "@/src/hooks/useProfile";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const insets = useSafeAreaInsets();

  const {
    profile,
    avatarUrl,
    isLoading,
    isSaving,
    editOpen,
    setEditOpen,
    control,
    handleSubmit,
    errors,
    openEdit,
    onSave,
    onAvatarUpload,
    onAvatarRemove,
  } = useProfile(user?.id);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.canvas,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <LoadingIndicator />
      </View>
    );
  }

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();


  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.canvas }}
        contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}>
        <ProfileHero
          fullName={fullName}
          role={profile?.role}
          organizationName={profile?.organization?.name ?? ""}
          avatarUrl={avatarUrl}
          onAvatarUpload={onAvatarUpload}
          onAvatarRemove={onAvatarRemove}
        />

        <Section title="Personal information" caption="01 / The basics" rightText="Edit" onRightPress={openEdit}>
          <InfoRow
            icon={<User size={19} color={colors.primary} />}
            label="First name"
            value={profile?.first_name ?? ""}
            onPress={openEdit}
          />
          <InfoRow
            icon={<User size={19} color={colors.primary} />}
            label="Last name"
            value={profile?.last_name ?? ""}
            onPress={openEdit}
            isLast
          />
        </Section>

        <Section title="Account details" caption="02 / Your access">
          <InfoRow
            icon={<Mail size={19} color={colors.primary} />}
            label="Email address"
            value={profile?.email ?? ""}
            locked
          />
          <InfoRow
            icon={<ShieldCheck size={19} color={colors.primary} />}
            label="Workspace role"
            value={profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : ""}
            isLast
          />
        </Section>

        <View style={styles.note}>
          <View style={styles.noteIcon}><LockKeyhole size={20} color={colors.primary} /></View>
          <View style={styles.noteContent}>
            <Text style={styles.noteTitle}>Your sign-in details</Text>
            <Text style={styles.noteText}>Your email is used to sign in. Editing your name won’t change your sign-in details.</Text>
          </View>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={editOpen}
        onClose={() => !isSaving && setEditOpen(false)}
        profile={profile}
        control={control}
        errors={errors}
        isSaving={isSaving}
        onSubmit={handleSubmit(onSave)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 12, gap: 28 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 18, backgroundColor: colors.primarySoft, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryBorder },
  noteIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  noteContent: { flex: 1, gap: 5 },
  noteTitle: { ...typography.label, color: colors.primary },
  noteText: typography.description,
});
