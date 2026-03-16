import { Building2, Trash2 } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

import UploadAvatar from "@/src/screens/profileImage";
import { TW } from "@/theme/twStyles";

type Props = {
  fullName: string;
  role?: string | null;
  organizationName?: string;
  avatarUrl: string | null;
  onAvatarUpload: (url: string) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
};

export default function ProfileHero({
  fullName,
  role,
  organizationName,
  avatarUrl,
  onAvatarUpload,
  onAvatarRemove,
}: Props) {
  return (
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
            onUploadComplete={onAvatarUpload}
          />

          {avatarUrl && (
            <Pressable
              onPress={onAvatarRemove}
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

      {!!organizationName && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 10,
            gap: 5,
          }}
        >
          <Building2 size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} />
          <Text
            style={{
              color: "rgba(255,255,255,0.65)",
              fontSize: 13,
              fontWeight: "600",
            }}
          >
            {organizationName}
          </Text>
        </View>
      )}
    </View>
  );
}
