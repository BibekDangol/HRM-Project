import { MINIO_BUCKET } from "@/src/constants/env";
import { s3 } from "@/src/lib/s3";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable } from "react-native";
import { Camera } from "lucide-react-native";
import tw from "twrnc";

type UploadAvatarProps = {
  size?: number;
  imageUrl?: string | null; // parent can pass existing avatar
  onUploadComplete?: (url: string) => void;
};

export default function UploadAvatar({
  size = 180,
  imageUrl,
  onUploadComplete,
}: UploadAvatarProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        quality: 1,
      });

      if (result.canceled) return;

      setLoading(true);
      const image = result.assets[0];
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const fileName = `img-${Date.now()}.jpg`;

      if (!MINIO_BUCKET) return Alert.alert("Error", "No bucket name found");

      const uploadResponse = await s3
        .upload({
          Bucket: MINIO_BUCKET,
          Key: fileName,
          Body: blob,
          ContentType: "image/jpeg",
          ACL: "public-read",
        })
        .promise();

      onUploadComplete?.(uploadResponse.Location);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error: any) {
      console.log("Upload Error:", error);
      Alert.alert("Error", error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable
      onPress={handleUpload}
      style={[
        tw`rounded-full bg-[#F2F6FC] border border-[#E5E5E5] items-center justify-center`,
        { width: size, height: size },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#0C0C0C" />
      ) : imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <Camera size={size / 4} color="#0C0C0C" />
      )}
    </Pressable>
  );
}
