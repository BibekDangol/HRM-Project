import * as Location from "expo-location";

export async function getUserLocationOrThrow() {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (perm.status !== "granted") {
    throw new Error("Location permission not granted.");
  }
  const pos = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude };
}