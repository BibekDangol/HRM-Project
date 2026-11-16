import UsersTabsLayout from "@/src/screens/users/layout/userTab";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Redirect } from "expo-router";

export default function UsersLayout() {
  const { loading, user, role, status } = useAuthStore();

  if (loading) return <LoadingIndicator message="Loading.." />;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (role === "admin") return <Redirect href="/(admin)/dashboard" />;
  if (status === "pending") return <Redirect href="/(auth)/changePassword" />;

  return <UsersTabsLayout />;
}
