import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import Constants from "expo-constants";
import { Platform } from "react-native";
import { parseHourMinute } from "@/src/utils/attendanceHelper";

// Set notification handler
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
  // Push token listeners are not supported on web; bail out before touching
  // the Notifications API to avoid the expo-notifications web warning.
  if (Platform.OS === "web") {
    return;
  }

  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted");
    return;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId =
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId;

  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  return token;
}

/* Schedule Attendance Notifications dynamically using DB rules */
export async function scheduleAttendanceNotifications(rules: any) {
  if (Platform.OS === "web") {
    return;
  }

  if (!rules?.checkin_start || !rules?.checkout_end) {
    console.warn(
      "Attendance rules are missing, cannot schedule notifications",
      rules,
    );
    return;
  }
  const { hour: checkInHour, minute: checkInMinute } = parseHourMinute(
    rules.checkin_start,
  );
  const { hour: checkOutHour, minute: checkOutMinute } = parseHourMinute(
    rules.checkout_start,
  );
  // Schedule Check-in Notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Check-in Time ⏰",
      body: "Your check-in window has started. Please check in from the HRM app.",
    },
    trigger: {
      type: "calendar",
      hour: checkInHour,
      minute: checkInMinute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  // Schedule Check-out Notification
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Check-out Time ⏰",
      body: "Workday is ending. Don't forget to check out.",
    },
    trigger: {
      type: "calendar",
      hour: checkOutHour,
      minute: checkOutMinute,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  console.log(
    `Scheduled check-in at ${checkInHour}:${checkInMinute} and check-out at ${checkOutHour}:${checkOutMinute}`,
  );
}
