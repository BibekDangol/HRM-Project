import "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { DrawerToggleButton } from "@react-navigation/drawer";

export default function AdminLayout() {
  return (
    <Drawer
      screenOptions={{
        headerLeft: () => <DrawerToggleButton />,
        headerTitleAlign: "center",
      }}
    >
      <Drawer.Screen name="admin_dashboard" options={{ title: "Admin Dashboard"}}/>
      <Drawer.Screen name="add_user" options={{ title: "Add User" }} />
    </Drawer>
  );
}
