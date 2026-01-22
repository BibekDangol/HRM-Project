import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
// import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminDashboard() {
  const router =useRouter();

  return(
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
    <View style = {styles.index}>
      <Text style = {styles.heading}>Welcome, Admin</Text>
      <Pressable 
      onPress={() => router.push("/(admin)/add_user")}
      style = {styles.press}>
        <Text style ={styles.presstext}>Add new user</Text>
      </Pressable>
      
    </View></SafeAreaView>
  )
};

const styles = StyleSheet.create({
  index: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
  press: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1F7A4D"
  },
  presstext:{
    color: "white",
    fontWeight: "700",
  } 
})
