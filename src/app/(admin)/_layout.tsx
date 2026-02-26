import { Tabs, usePathname, useRouter } from "expo-router";
import { ArrowLeft, User } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Image, Pressable, Text, View } from "react-native";

import { adminTabs } from "@/src/config/adminTabs";
import { useAdminHeaderMenu } from "@/src/hooks/useAdminHeaderMenu";
import AdminTabBar from "@/src/screens/admin/components/AdminTabBar";
import ProfileMenu from "@/src/screens/admin/components/ProfileMenu";
import { fetchCurrentUserProfleService } from "@/src/services/currentuser.service";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useUsersStore } from "@/src/store/useUsersStore";
import tw from "twrnc";

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const menu = useAdminHeaderMenu();
  const { user, loading } = useAuthStore();
  const { userProfile, setUserProfile } = useUsersStore();

  const fetchUserProfile = useCallback(async () => {
    if (!user?.id || userProfile) return;
    const profile = await fetchCurrentUserProfleService(user?.id);
    setUserProfile(profile);
  }, [user?.id, setUserProfile, userProfile]);
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile, loading]);
  const showBackButton = !adminTabs.some((tab) => pathname?.includes(tab.name));
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerLeft: showBackButton
          ? () => (
              <Pressable style={tw`ml-4`} onPress={() => router.back()}>
                <ArrowLeft size={24} />
              </Pressable>
            )
          : undefined,

        headerTitle: ({ children }) => (
          <View style={tw`flex-row items-center gap-4`}>
            {/* <Image
              style={{ width: 30, height: 30, borderRadius: 14 }}
              source={{
                uri: 'https://picsum.photos/200/300',
              }}
            />
            <Text style={tw`font-semibold text-md`}>{userProfile?.first_name}</Text>
          </View>
        ),

        headerRight: () => (
          <View style={tw`mr-4`}>
            <Pressable onPress={menu.toggle}>
              <View
                style={tw`w-9 h-9 rounded-full bg-white border border-[#E5E5E5] items-center justify-center`}
              >
                <User size={18} />
              </View>
            </Pressable>
            <ProfileMenu
              open={menu.open}
              onProfile={() => router.push("/(admin)/profile")}
              onLogout={menu.logout}
            />
          </View>
        ),
      }}
      tabBar={(props) => <AdminTabBar {...props} />}
    >
      {adminTabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </Tabs>
  );
}
