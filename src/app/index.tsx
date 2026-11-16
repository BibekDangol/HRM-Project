import LoadingIndicator from "../components/LoadingIndicator";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Index() {
  const { loading, role, user, status } = useAuthStore();
  if (loading) {
    return <LoadingIndicator message="Loading.." />;
  }
  if (user && role === "admin") {
    return <Redirect href="/(admin)/dashboard" />;
  }
  if (user && role === "user") {
    if (status === "pending") {
      return <Redirect href="/(auth)/changePassword" />;
    }
    return <Redirect href="/(users)/dashboard" />;
  }
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
}
