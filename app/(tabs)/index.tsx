
import { Text, View, TextInput } from "react-native";

import { Redirect } from "expo-router";

export default function HomeScreen() {
  const isLoggedIn = false; // example

  if (!isLoggedIn) {
    return <Redirect href="/login" />;
  }

  // const router = useRouter()

  // useEffect(() => {
  //   router.push("/(auth)/login")
  // }, [router])

  return (
    <View>
      <Text>Welcome to the application</Text>
      <TextInput></TextInput>
    </View>
  );
}


