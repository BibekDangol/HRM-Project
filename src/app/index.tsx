import { useAuthStore } from "@/src/store/useAuthStore";
import { Redirect } from "expo-router";
import LoadingIndicator from "../components/LoadingIndicator";

export default function Index() {
  console.log("app index>>>>>>>>>>>>1");

  const { loading, role } = useAuthStore();

  console.log("app index>>>>>>>>>>>>2");

  const { user } = useAuthStore();

  console.log("app index>>>>>>>>>>>>3");

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
