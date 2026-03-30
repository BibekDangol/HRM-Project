import { FormInput, FormOutput } from "@/src/types/user";
import { useEffect, useState } from "react";
import {
  fetchProfileService,
  removeAvatarService,
  updateAvatarService,
  updateProfileService,
} from "../../services/profile.service";

import { usersProfileSchema } from "@/src/schema/users/userprofiles.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";
import { ProfileData } from "../../types/profile.types";

export function useProfile(userId?: string ) {
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
    defaultValues: {
      orgName: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const fetchProfile = async () => {
    if (!userId) return;
    try {
      setIsLoading(true);
      const pd = await fetchProfileService(userId);
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
  }, [userId]);

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
    if (!userId || !profile) return;

    try {
      setIsSaving(true);
      await updateProfileService(userId, profile.organization_id, values);
      setEditOpen(false);
      await fetchProfile();
      Alert.alert("Saved", "Profile updated successfully.");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message ?? "Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const onAvatarUpload = async (url: string) => {
    if (!userId) return;
    setAvatarUrl(url);
    try {
      await updateAvatarService(userId, url);
    } catch {
      Alert.alert("Error", "Failed to save avatar.");
    }
  };

  const onAvatarRemove = async () => {
    if (!userId) return;
    try {
      await removeAvatarService(userId);
      setAvatarUrl(null);
    } catch {
      Alert.alert("Error", "Failed to remove avatar.");
    }
  };

  return {
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
  };
}
