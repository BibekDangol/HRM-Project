import LoadingIndicator from "../components/LoadingIndicator";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";

export default function Index() {
  const { loading, role } = useAuthStore();
  const { user } = useAuthStore();
  if (loading) {
    return <LoadingIndicator message="Loading.." />;
  }
  if (user && role === "admin") {
    return <Redirect href="/(admin)/dashboard" />;
  }
  if (user && role === "user") {
    return <Redirect href="/(users)/dashboard" />;
  }
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }
}
