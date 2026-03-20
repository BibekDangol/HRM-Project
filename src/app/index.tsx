import { useAuthStore } from "@/src/store/useAuthStore";
import { Redirect } from "expo-router";
import LoadingIndicator from "../components/LoadingIndicator";

export default function Index() {
  const { loading, role } = useAuthStore();
  const { user } = useAuthStore();
  console.log("index", role);
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
