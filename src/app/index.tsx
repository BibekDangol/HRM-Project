import { ActivityIndicator, Text, View } from "react-native";

import { Redirect } from "expo-router";
import tw from 'twrnc';
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Index() {
  const { loading, role } = useAuthStore();
  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" />
        <Text>Loading..</Text></View>
    )
  }
  if (role === "admin") {
    return <Redirect href='/(admin)/dashboard' />;
  }
  if (role === "user") {
    return <Redirect href='/(users)/dashboard' />
  }
  return <Redirect href='/(auth)/login' />
}
