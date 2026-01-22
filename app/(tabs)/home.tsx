import { router } from "expo-router";
import {Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  return (
    <SafeAreaView>
      <View>
        <Text
          style={styles.footerLink}
          onPress={() => router.push("/login")}
        >
          Logout
        </Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
    footerText: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 14,
    color: "#1D1D1D",
  },

  footerLink: {
    color: "#1F7A4D",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
}

)
