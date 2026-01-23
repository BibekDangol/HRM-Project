import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { RootStackParamList } from "@/src/navigation/types";
import { useAuthStore } from "@/store/useAuthStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "expo-router";
import React from "react";
import tw from "twrnc";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const signOut = useAuthStore.getState().signOut;
  const handleLogout = async () => {
    await signOut();
    Alert.alert("success", "You have been logged out");
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };
  // Dummy data for menu
  const menuItems = [
    { id: 1, title: "Employee Directory", description: "View all employees" },
    { id: 2, title: "Attendance", description: "Track employee attendance" },
    { id: 3, title: "Leaves", description: "Manage leaves and approvals" },
    { id: 4, title: "Payroll", description: "View salary details" },
    { id: 5, title: "Reports", description: "Generate HR reports" },
  ];

  return (
    <ScrollView style={tw`bg-gray-100 flex-1 p-4`}>
      {/* Header */}
      <View style={tw`mb-6`}>
        <Text style={tw`text-3xl font-bold text-gray-800`}>Welcome to ERM</Text>
        <Text style={tw`text-gray-600 mt-1`}>
          Manage your employees efficiently
        </Text>
      </View>

      {/* Menu */}
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tw`bg-white rounded-xl p-4 mb-4 shadow`}
          onPress={() => console.log(`Navigate to ${item.title}`)}
        >
          <Text style={tw`text-xl font-semibold text-gray-800`}>
            {item.title}
          </Text>
          <Text style={tw`text-gray-500 mt-1`}>{item.description}</Text>
        </TouchableOpacity>
      ))}

      {/* Quick Action Buttons */}
      <View style={tw`mt-6`}>
        <Text style={tw`text-xl font-bold mb-2`}>Quick Actions</Text>
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity style={tw`bg-blue-500 rounded-xl p-4 flex-1 mr-2`}>
            <Text style={tw`text-white text-center font-semibold`}>
              Add Employee
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-green-500 rounded-xl p-4 flex-1 ml-2`}>
            <Text style={tw`text-white text-center font-semibold`}>
              Mark Attendance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-green-500 rounded-xl p-4 flex-1 ml-2`}
            onPress={handleLogout}
          >
            <Text style={tw`text-white text-center font-semibold`}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;