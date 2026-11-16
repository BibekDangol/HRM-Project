import { colors } from "@/theme/colors";
import UploadAvatar from "@/src/screens/profileImage";
import { TW } from "@/theme/twStyles";
import { Building2, Trash2 } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

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
          borderColor: colors.onPrimaryBorder,
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
              accessibilityRole="button"
              accessibilityLabel="Remove profile photo"
              onPress={onAvatarRemove}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 48,
                height: 48,
                backgroundColor: TW.DANGER,
                borderRadius: 24,
                borderWidth: 2,
                borderColor: TW.bgSecondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={18} color={colors.surface} />
            </Pressable>
          )}
        </View>
      </View>

      <Text
        style={{
          marginTop: 14,
          color: colors.surface,
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
            borderColor: colors.accentHalf,
            backgroundColor: colors.accentWash,
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: colors.surface,
              fontSize: 14,
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
          <Building2 size={12} color={colors.onPrimaryHalf} strokeWidth={2} />
          <Text
            style={{
              color: colors.surface,
              fontSize: 14,
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
