import React from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View } from "react-native";
import { useAuthStore } from "@/src/store/useAuthStore";
import { TW } from "@/theme/twStyles";

import { Mail, User } from "lucide-react-native";
import { useProfile } from "@/src/hooks/useProfile";
import ProfileActions from "@/src/components/profile/ProfileActions";
import Section from "@/src/components/profile/Section";
import InfoRow from "@/src/components/profile/InfoRow";
import EditProfileModal from "@/src/components/profile/EditProfileModal";
import ProfileHero from "@/src/components/profile/ProfileHero";

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  const {
    profile,
    avatarUrl,
    isLoading,
    isSaving,
    editOpen,
    setEditOpen,
    control,
    handleSubmit,
    reset,
    errors,
    fetchProfile,
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
          backgroundColor: TW.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={TW.bgSecondary} size="small" />
        <Text
          style={{
            marginTop: 10,
            fontSize: 13,
            color: TW.faint,
            fontWeight: "500",
          }}
        >
          Loading…
        </Text>
      </View>
    );
  }

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  const role = profile?.role;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: TW.bg }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHero
          fullName={fullName}
          role={role}
          organizationName={profile?.organization?.name ?? ""}
          avatarUrl={avatarUrl}
          onAvatarUpload={onAvatarUpload}
          onAvatarRemove={onAvatarRemove}
        />

        <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
          <ProfileActions onEdit={openEdit} />

          <Section title="Personal Info">
            <InfoRow
              icon={<User size={16} color={TW.bgSecondary} strokeWidth={1.8} />}
              label="First Name"
              value={profile?.first_name ?? ""}
              onPress={openEdit}
            />
            <InfoRow
              icon={<User size={16} color={TW.bgSecondary} strokeWidth={1.8} />}
              label="Last Name"
              value={profile?.last_name ?? ""}
              onPress={openEdit}
            />
            <InfoRow
              icon={<Mail size={16} color={TW.bgSecondary} strokeWidth={1.8} />}
              label="Email"
              value={profile?.email ?? ""}
              locked
              isLast
            />
          </Section>
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
