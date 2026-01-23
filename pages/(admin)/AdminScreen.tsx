import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { RootStackParamList } from "@/src/navigation/types";
import tw from "twrnc";
import { useAuthStore } from "@/store/useAuthStore";

type Props = NativeStackScreenProps<RootStackParamList, "Admin">;

const AdminScreen = ({ navigation }: Props) => {
  const signOut = useAuthStore((state) => state.signOut);

  // Dummy feature cards
  const features = [
    {
      title: "Dashboard",
      description: "View overall stats",
      route: "Dashboard",
    },
    {
      title: "Manage Users",
      description: "Add/Edit/Delete employees",
      route: "ManageUsers",
    },
    {
      title: "Organizations",
      description: "View org info",
      route: "Organizations",
    },
    { title: "Reports", description: "View HR reports", route: "Reports" },
    {
      title: "Settings",
      description: "App & Profile settings",
      route: "Settings",
    },
  ];

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-blue-600 py-6 px-4`}>
        <Text style={tw`text-white text-2xl font-bold`}>Admin Panel</Text>
        <Text style={tw`text-blue-200 mt-1`}>Manage your organization</Text>
      </View>

      <ScrollView contentContainerStyle={tw`p-4 space-y-4`}>
        {features.map((feature, idx) => (
          <TouchableOpacity
            key={idx}
            style={tw`bg-white p-4 rounded-xl shadow`}
            onPress={() => {
              // Navigate to feature screen
              navigation.navigate(feature.route as keyof RootStackParamList);
            }}
          >
            <Text style={tw`text-lg font-bold text-gray-800`}>
              {feature.title}
            </Text>
            <Text style={tw`text-gray-500 mt-1`}>{feature.description}</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={signOut}
          style={tw`bg-red-600 py-4 rounded-xl mt-6 shadow`}
        >
          <Text style={tw`text-white text-center font-bold text-lg`}>
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AdminScreen;