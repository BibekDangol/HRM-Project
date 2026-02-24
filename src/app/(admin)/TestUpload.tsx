import { useAuthStore } from "@/src/store/useAuthStore";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    StyleSheet,
    Text,
    View,
} from "react-native";

const apiClient = axios.create({
  baseURL: "https://dibcpzqlaypincnthhnm.supabase.co/functions/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const session = useAuthStore.getState().session;
  const token = session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const TestUpload = () => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      setLoading(true);

      // 1️⃣ Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];

      const fileName = `test-${Date.now()}.jpg`;

      // 2️⃣ Ask Edge Function for signed URL
      const res = await apiClient.post("/s3-sign", {
        filename: fileName,
        contentType: asset.mimeType || "image/jpeg",
      });

      const uploadUrl = res.data.url;

      // 3️⃣ Convert to blob
      const fileResponse = await fetch(asset.uri);
      const blob = await fileResponse.blob();

      // 4️⃣ Upload to MinIO
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": asset.mimeType || "image/jpeg",
        },
        body: blob,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      Alert.alert("Success", "File uploaded successfully 🎉");
    } catch (error: any) {
      console.log(error);
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MinIO Upload Test</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Pick & Upload Image" onPress={handleUpload} />
      )}
    </View>
  );
};

export default TestUpload;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
  },
});
