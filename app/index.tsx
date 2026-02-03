import { ActivityIndicator, Text, View } from "react-native";

import { useAuthStore } from "@/store/useAuthStore";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import tw from 'twrnc';

export default function Index() {
  const { user, loading, role } = useAuthStore();
  const { restoreSession } = useAuthStore();
  useEffect(() => {
    const init = async () => {
      await restoreSession();
    }
    init();
  }, []);
  if (loading) {
    return (
      <View style={tw`flex-1 items-center justify-center`}>
        <ActivityIndicator size="large" />
        <Text>Loading..</Text></View>
    )
  }
  if (!user || !role) {
    return <Redirect href='/(auth)/login' />;
  }
  if (role === "admin") {
    return <Redirect href='/(admin)/dashboard' />;
  }
  if (role === "user") {
    return <Redirect href='/(users)/dashboard' />
  }
  return <Redirect href='/(auth)/login' />
}
