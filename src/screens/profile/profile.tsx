import { Mail, User } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import EditProfileModal from "@/src/components/profile/EditProfileModal";
import InfoRow from "@/src/components/profile/InfoRow";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import ProfileHero from "@/src/components/profile/ProfileHero";
import Section from "@/src/components/profile/Section";
import { TW } from "@/theme/twStyles";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useProfile } from "@/src/hooks/useProfile";

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
          // backgroundColor: TW.bgPrimary,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <LoadingIndicator />
      </View>
    );
  }

  const fullName =
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  // const role = profile?.role;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}>
        <ProfileHero
          fullName={fullName}
          // role={role}
          organizationName={profile?.organization?.name ?? ""}
          avatarUrl={avatarUrl}
          onAvatarUpload={onAvatarUpload}
          onAvatarRemove={onAvatarRemove}
        />

        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Section
            title="Personal Info"
            rightText="Edit"
            onRightPress={openEdit}>
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
