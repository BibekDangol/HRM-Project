import React, { useEffect } from "react";
import AdminScreen from "@/pages/(admin)/AdminScreen";
import HomeScreen from "@/pages/(users)/HomeScreen";
import LoginScreen from "@/components/LoginScreen";
import ManageUsers from "@/pages/(admin)/ManageUsers";
import { RootStackParamList } from "./types";
import SignupScreen from "@/components/SignupScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@/store/useAuthStore";

const Stack = createNativeStackNavigator<RootStackParamList>();
const AppNavigator = () => {
  const { loading, restoreSession } = useAuthStore();
  useEffect(() => {
    restoreSession();
  }, []);
  if (loading) return null; // wait until session is restored
  return (
    //This is dynamic Routing
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsers} />
      {/* <Stack.Screen name="AdminDrawer" component={AdminDrawerNavigator} /> */}
    </Stack.Navigator>
  );
};
{
  /* Each new screen is pushed onto stack, one pops and another screen shows up */
}

export default AppNavigator;