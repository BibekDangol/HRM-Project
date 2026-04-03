import { Pencil, Trash2 } from "lucide-react-native";
import { Alert, Image, Pressable, Text, View } from "react-native";

import { UserProfile } from "@/src/types/admin";
import { TW } from "@/theme/twStyles";
import tw from "twrnc";
import Capsule from "../../../components/Capsule";

type Props = {
  user: UserProfile;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string) => void;
  getSupervisorName: (supervisorId: string | null) => string;
};

export const UserCard = ({
  user,
  onEdit,
  onDelete,
  getSupervisorName,
}: Props) => {
  return (
    <View style={tw` gap-4 bg-white border ${TW.BORDER} rounded-2xl px-4 py-4`}>
      <View style={tw`flex-row justify-between`}>
        <View style={tw`flex-row gap-2`}>
          {/* Image */}
          <View>
            {user.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={tw`w-12 h-12 rounded-full`}
              />
            ) : (
              <View
                style={tw`w-12 h-12 rounded-full bg-gray-300 items-center justify-center`}>
                <Text style={tw`text-sm font-bold text-white`}>
                  {`${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* User Info */}
          <View style={tw`flex-col gap-1`}>
            <View style={tw`flex-row gap-4`}>
              <Text style={tw`text-base font-bold ${TW.textPrimary}`}>
                {user.first_name} {user.last_name}
              </Text>
              <Capsule
                text={user.role}
                color={user.role === "admin" ? "teal" : "gray"}
              />
            </View>
            <View style={tw`mr-4 gap-0.5`}>
              <Text style={tw`text-sm ${TW.textSecondary}`} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <Text style={tw`text-xs ${TW.textTertiary}`}>
              Supervisor: {getSupervisorName(user.supervisor_id)}
            </Text>
          </View>
        </View>
        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <View style={tw`flex-row gap-2`}>
            {onEdit && (
              <Pressable
                onPress={() => onEdit?.(user)}
                hitSlop={12}
                style={({ pressed }) => [
                  tw`w-10 h-10 rounded-full items-center justify-center ${TW.bgAction}/90`,
                  pressed && tw`opacity-70`,
                ]}>
                <Pencil size={18} color={TW.bgPrimary} />
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                onPress={() =>
                  Alert.alert(
                    "Delete User",
                    `Do you want to delete ${user.first_name}?`,
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onDelete?.(user.id),
                      },
                    ],
                  )
                }
                hitSlop={8}
                style={({ pressed }) => [
                  tw`w-10 h-10 rounded-full items-center justify-center bg-red-400`,
                  pressed && tw`opacity-70`,
                ]}>
                <Trash2 size={18} color={TW.bgPrimary} />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};
