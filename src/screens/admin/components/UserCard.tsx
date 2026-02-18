import { Alert, Pressable, Text, View } from "react-native";

import { UserProfile } from "@/src/types/admin";
import { Pencil, Trash2 } from "lucide-react-native";
import React from "react";
import tw from "twrnc";
import Capsule from "../../../components/Capsule";

type Props = {
  user: UserProfile;
  getSupervisorName: (id?: string | null) => string;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string) => void;
};

const UserCard = ({ user, onEdit, onDelete, getSupervisorName }: Props) => {
  return (
    <View style={tw`bg-white border border-slate-100 rounded-2xl px-4 py-4`}>
      {/* Top row — name left, role right */}
      <View style={tw`flex-row items-start justify-between mb-3`}>
        <Text
          style={[
            tw`text-base font-bold text-slate-900 flex-1 mr-3`,
            { maxWidth: 150 },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {user.first_name} {user.last_name}
        </Text>

        <Capsule
          text={user.role}
          color={user.role === "admin" ? "red" : "green"}
        />
      </View>

      {/* Bottom row — email/supervisor left, actions right */}
      <View style={tw`flex-row items-end justify-between`}>
        <View style={tw`flex-1 mr-4 gap-0.5`}>
          <Text style={tw`text-sm text-slate-500`}>
            {getSupervisorName(user.supervisor_id)}
          </Text>
          <Text style={tw`text-sm text-slate-400`} numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        {(onEdit || onDelete) && (
          <View style={tw`flex-row gap-2`}>
            {onEdit && (
              <Pressable
                onPress={() => onEdit?.(user)}
                hitSlop={8}
                style={({ pressed }) => [tw`p-1`, pressed && tw`opacity-70`]}
              >
                <Pencil size={16} color="#16a34a" />
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
                style={({ pressed }) => [tw`p-1`, pressed && tw`opacity-70`]}
              >
                <Trash2 size={16} color="#dc2626" />
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default UserCard;
