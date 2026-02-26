import * as ImagePicker from "expo-image-picker";

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  View,
} from "react-native";

import AWS from "aws-sdk";

const MINIO_ENDPOINT = process.env.EXPO_PUBLIC_MINIO_ENDPOINT;
const MINIO_PORT = process.env.EXPO_PUBLIC_MINIO_PORT;
const MINIO_ACCESS_KEY = process.env.EXPO_PUBLIC_MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.EXPO_PUBLIC_MINIO_SECRET_KEY;
const MINIO_BUCKET = process.env.EXPO_PUBLIC_MINIO_BUCKET;

/* 🔴 Create S3 Client */
const s3 = new AWS.S3({
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleUpload = async () => {
    try {
      // const permission =
      //   await ImagePicker.requestMediaLibraryPermissionsAsync();

      // if (!permission.granted) {
      //   Alert.alert("Permission required");
      //   return;
      // }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 1,
      });

      if (result.canceled) return;

      setLoading(true);

      const image = result.assets[0];

      // Convert image to blob
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const fileName = `img-${Date.now()}.jpg`;
      console.log("MINIO_BUCKET", MINIO_BUCKET);

      if (!MINIO_BUCKET) return Alert.alert("Error", "No bucket name found");

      // Upload
      const uploadResponse = await s3
        .upload({
          Bucket: MINIO_BUCKET,
          Key: fileName,
          Body: blob,
          ContentType: "image/jpeg",
          ACL: "public-read",
        })
        .promise();

      console.log("uploadResponse", uploadResponse);
      // Public URL

      setImageUrl(uploadResponse.Location);

      Alert.alert("Success 🎉", "Image uploaded successfully!");
    } catch (error: any) {
      console.log("Upload Error:", error);
      Alert.alert("Error", error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Upload Image" onPress={handleUpload} />
      )}

      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
  },
});
