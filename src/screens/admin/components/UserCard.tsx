import { Alert, Text, TouchableOpacity, View } from "react-native";

import Capsule from "../../../components/Capsule";
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { UserProfile } from "@/src/types/admin";
import tw from "twrnc";

type Props = {
  user: UserProfile;
  getSupervisorName: (id?: string | null) => string;
  onEdit?: (user: UserProfile) => void;
  onDelete?: (id: string) => void;
};

const UserCard = ({ user, onEdit, onDelete, getSupervisorName }: Props) => {
  return (
    <View style={tw`bg-white rounded-xl shadow p-4 mb-4 flex-row items-center`}>
      <View style={tw`flex-1`}>
        <View style={tw`flex-row gap-2 items-center mb-2`}>
          <Text style={tw`text-gray-900 font-semibold text-lg`}>
            {user.first_name} {user.last_name}
          </Text>
          <Capsule
            text={user.role}
            color={user.role === "admin" ? "red" : "green"}
          />
        </View>
        <Text>{getSupervisorName(user.supervisor_id)}</Text>
        <Text style={tw`text-gray-500 text-sm`}>{user.email}</Text>
      </View>
      {/* only render buttons if handlers are provided */}
      {(onEdit || onDelete) && (
        <View style={tw`flex-row gap-2`}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit?.(user)}
              style={tw`p-2 bg-green-700 rounded-lg`}
            >
              <Ionicons name="create-outline" size={20} color="white" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
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
                  ]
                )
              }
              style={tw`p-2 bg-red-500 rounded-lg`}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

export default UserCard
