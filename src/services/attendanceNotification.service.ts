import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import {
  CHECKIN_HOUR,
  CHECKIN_MINUTE,
  CHECKOUT_HOUR,
  CHECKOUT_MINUTE
} from "../utils/attendanceNotification.constants";

import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
/* Register device for push notifications */
export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } =
      await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "default",
      {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      }
    );
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;
  console.log("Push Token:", token);
  return token;
}
/* Schedule Attendance Notifications */
export async function scheduleAttendanceNotifications() {
  // await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Check-in Time ⏰",
      body:
        "Your check-in window has started. Please check in from the HRM app.",
    },
trigger: {
  type: "calendar",
  hour: CHECKIN_HOUR,
  minute: CHECKIN_MINUTE,
  repeats: true,
} as Notifications.CalendarTriggerInput
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Check-out Time ⏰",
      body: "Workday is ending. Don't forget to check out.",
    },
    trigger: {
      type: "calendar",
      hour: CHECKOUT_HOUR,
      minute: CHECKOUT_MINUTE,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });
}
