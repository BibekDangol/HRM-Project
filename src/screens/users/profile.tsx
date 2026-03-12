import { FormInput, FormOutput } from "@/src/types/user";
import {
  Building2,
  ChevronRight,
  Lock,
  Mail,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { usersProfileSchema } from "@/src/schema/users/userprofiles.schema";
import { useAuthStore } from "@/src/store/useAuthStore";
import { supabase } from "@/src/supabase/supabaseClient";
import { ProfileData } from "@/src/types/profile.types";
import { TW } from "@/theme/twStyles";
import { zodResolver } from "@hookform/resolvers/zod";
import UploadAvatar from "../profileImage";

/* ─── InfoRow ────────────────────────────────────────────── */
type RowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  onPress?: () => void;
  isLast?: boolean;
  locked?: boolean;
};

function InfoRow({ icon, label, value, onPress, isLast, locked }: RowProps) {
  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 13,
        backgroundColor: TW.bgPrimary,
        opacity: pressed && onPress && !locked ? 0.6 : 1,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: TW.BORDER,
      })}
    >
      {/* Icon pill */}
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: `${TW.bgSecondary}12`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 13,
        }}
      >
        {icon}
      </View>

      {/* Text block */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: TW.faint,
            letterSpacing: 0.3,
            marginBottom: 2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: locked ? TW.faint : TW.bgSecondary,
            letterSpacing: 0.1,
          }}
          numberOfLines={1}
        >
          {value || "—"}
        </Text>
      </View>

      {/* Right icon */}
      {locked ? (
        <Lock size={13} color={TW.faint} strokeWidth={1.6} />
      ) : onPress ? (
        <ChevronRight size={15} color={TW.faint} strokeWidth={1.6} />
      ) : null}
    </Pressable>
  );
}

/* ─── Section ────────────────────────────────────────────── */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: TW.faint,
          letterSpacing: 0.9,
          textTransform: "uppercase",
          marginBottom: 8,
          marginLeft: 2,
        }}
      >
        {title}
      </Text>

      {/* Card with shadow outside, clip inside */}
      <View
        style={[
          {
            borderRadius: 16,
            backgroundColor: TW.bgPrimary,
            borderWidth: 1,
            borderColor: TW.BORDER,
          },
          Platform.OS === "ios"
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
              }
            : { elevation: 1 },
        ]}
      >
        <View style={{ borderRadius: 15, overflow: "hidden" }}>{children}</View>
      </View>
    </View>
  );
}

/* ─── Modal input ────────────────────────────────────────── */
function ModalInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  error?: string;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: TW.textSecondary,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          marginBottom: 7,
        }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#C9D0D8"
        style={{
          backgroundColor: error ? "#FEF2F2" : TW.BORDER,
          borderWidth: 1,
          borderColor: error ? TW.DANGER : TW.BORDER,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 13,
          fontSize: 15,
          fontWeight: "500",
          color: TW.bgSecondary,
        }}
      />
      {!!error && (
        <Text
          style={{
            fontSize: 12,
            color: TW.DANGER,
            fontWeight: "500",
            marginTop: 5,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

/* ─── Screen ─────────────────────────────────────────────── */
export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(usersProfileSchema),
    defaultValues: { orgName: "", firstName: "", lastName: "", email: "" },
  });

  /* fetch */
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, avatar, email, organization_id, organization(name), role",
        )
        .eq("id", user.id)
        .single();
      if (error) throw error;
      const pd = data as unknown as ProfileData;
      setProfile(pd);
      setAvatarUrl(pd.avatar ?? null);
      reset({
        firstName: pd.first_name ?? "",
        lastName: pd.last_name ?? "",
        email: pd.email ?? "",
        orgName: pd.organization?.name ?? "",
      });
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to load profile.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const openEdit = () => {
    if (!profile) return;
    reset({
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      email: profile.email ?? "",
      orgName: profile.organization?.name ?? "",
    });
    setEditOpen(true);
  };

  const onSave = async (values: FormOutput) => {
    if (!user?.id || !profile) return;
    try {
      setIsSaving(true);
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
        })
        .eq("id", user.id);
      if (pErr) throw pErr;
      if (profile.organization_id && values.orgName.trim()) {
        const { error: oErr } = await supabase
          .from("organization")
          .update({ name: values.orgName.trim() })
          .eq("id", profile.organization_id);
        if (oErr) throw oErr;
      }
      setEditOpen(false);
      await fetchProfile();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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
  const role = (profile as any)?.role as string | undefined;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: TW.bg }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <View
        style={{
          backgroundColor: TW.bgSecondary,
          paddingTop: 36,
          paddingBottom: 64,
          alignItems: "center",
          borderBottomLeftRadius: 44,
          borderBottomRightRadius: 44,
        }}
      >
        {/* Avatar with white border ring */}
        <View
          style={{
            borderRadius: 54,
            borderWidth: 3,
            borderColor: "rgba(255,255,255,0.3)",
            padding: 3,
          }}
        >
          <View style={{ position: "relative" }}>
            <UploadAvatar
              size={84}
              imageUrl={avatarUrl}
              onUploadComplete={async (url) => {
                setAvatarUrl(url);
                if (!user?.id) return;
                const { error } = await supabase
                  .from("profiles")
                  .update({ avatar: url } as any)
                  .eq("id", user.id);
                if (error) Alert.alert("Error", "Failed to save avatar.");
              }}
            />
            {avatarUrl && (
              <Pressable
                onPress={async () => {
                  if (!user?.id) return;
                  const { error } = await supabase
                    .from("profiles")
                    .update({ avatar: null } as any)
                    .eq("id", user.id);
                  if (error) Alert.alert("Error", "Failed to remove avatar.");
                  else setAvatarUrl(null);
                }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 24,
                  height: 24,
                  backgroundColor: TW.DANGER,
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: TW.bgSecondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Trash2 size={11} color="#fff" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Name */}
        <Text
          style={{
            marginTop: 14,
            color: "#ffffff",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: -0.5,
          }}
        >
          {fullName || "—"}
        </Text>

        {/* Role pill — orange outline */}
        {!!role && (
          <View
            style={{
              marginTop: 8,
              borderWidth: 1.5,
              borderColor: "rgba(247,164,75,0.5)",
              backgroundColor: "rgba(247,164,75,0.1)",
              paddingHorizontal: 14,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                color: TW.textTertiary,
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 0.4,
              }}
            >
              {role}
            </Text>
          </View>
        )}

        {/* Org — subtle white */}
        {profile?.organization?.name && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
              gap: 5,
            }}
          >
            <Building2
              size={12}
              color="rgba(255,255,255,0.5)"
              strokeWidth={2}
            />
            <Text
              style={{
                color: "rgba(255,255,255,0.65)",
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              {profile.organization.name}
            </Text>
          </View>
        )}
      </View>

      {/* ── Cards ────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
        {/* Edit button — pulled over hero */}
        <Pressable
          onPress={openEdit}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            backgroundColor: TW.textTertiary,
            borderRadius: 14,
            paddingVertical: 14,
            marginBottom: 24,
            opacity: pressed ? 0.82 : 1,
            ...Platform.select({
              ios: {
                shadowColor: TW.textTertiary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
              },
              android: { elevation: 4 },
            }),
          })}
        >
          <Pencil size={15} color="#fff" strokeWidth={2} />
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: 15,
              letterSpacing: 0.2,
            }}
          >
            Edit Profile
          </Text>
        </Pressable>

        {/* Personal info */}
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

        {/* Organization
        <Section title="Organization">
          <InfoRow
            icon={
              <Building2 size={16} color={TW.bgSecondary} strokeWidth={1.8} />
            }
            label="Organization Name"
            value={profile?.organization?.name ?? ""}
            isLast
          />
        </Section> */}
      </View>

      {/* ── Edit Modal ───────────────────────────────────── */}
      <Modal visible={editOpen} transparent animationType="slide">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              justifyContent: "flex-end",
            }}
            onPress={() => !isSaving && setEditOpen(false)}
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: TW.bgPrimary,
                borderTopLeftRadius: 26,
                borderTopRightRadius: 26,
                paddingHorizontal: 20,
                paddingTop: 14,
                paddingBottom: Platform.OS === "ios" ? 44 : 32,
              }}
            >
              {/* Handle */}
              <View style={{ alignItems: "center", marginBottom: 18 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: TW.BORDER,
                  }}
                />
              </View>

              {/* Header row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 22,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: TW.bgSecondary,
                    letterSpacing: -0.2,
                  }}
                >
                  Edit Profile
                </Text>
                <Pressable
                  onPress={() => !isSaving && setEditOpen(false)}
                  hitSlop={12}
                  style={({ pressed }) => ({
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: TW.BORDER,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <X size={15} color={TW.textSecondary} strokeWidth={2} />
                </Pressable>
              </View>

              {/* First name */}
              <Controller
                control={control}
                name="firstName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <ModalInput
                    label="First Name"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="First name"
                    error={errors.firstName?.message}
                  />
                )}
              />

              {/* Last name */}
              <Controller
                control={control}
                name="lastName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <ModalInput
                    label="Last Name"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder="Last name"
                    error={errors.lastName?.message}
                  />
                )}
              />

              {/* Email locked */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: TW.textSecondary,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 7,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 9,
                  backgroundColor: TW.BORDER,
                  borderWidth: 1,
                  borderColor: TW.BORDER,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 13,
                  marginBottom: 24,
                }}
              >
                <Lock size={13} color={TW.faint} strokeWidth={1.8} />
                <Text
                  style={{ fontSize: 15, fontWeight: "500", color: TW.faint }}
                >
                  {profile?.email ?? "—"}
                </Text>
              </View>

              {/* Buttons */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => !isSaving && setEditOpen(false)}
                  style={({ pressed }) => ({
                    flex: 1,
                    borderWidth: 1.5,
                    borderColor: TW.BORDER,
                    borderRadius: 13,
                    paddingVertical: 14,
                    alignItems: "center",
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: TW.textSecondary,
                    }}
                  >
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit(onSave)}
                  disabled={isSaving}
                  style={({ pressed }) => ({
                    flex: 1,
                    backgroundColor: TW.bgSecondary,
                    borderRadius: 13,
                    paddingVertical: 14,
                    alignItems: "center",
                    opacity: isSaving ? 0.55 : pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}
                  >
                    {isSaving ? "Saving…" : "Update"}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}
