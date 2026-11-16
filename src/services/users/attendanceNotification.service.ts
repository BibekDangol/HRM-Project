import * as Notifications from "expo-notifications";

import { Platform } from "react-native";
import {
  CHECKIN_NOTIFICATION_ID,
  CHECKOUT_NOTIFICATION_ID,
  parseHourMinute,
} from "@/src/utils/attendanceHelper";
import { AttendanceRules } from "@/src/types/attendance";

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
    return false;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Permission not granted");
    return false;
  }

  // These reminders are local; no Expo push token or network request is needed.
  return true;
}

/* Schedule Attendance Notifications dynamically using DB rules */
export async function scheduleAttendanceNotifications(rules: AttendanceRules) {
  if (Platform.OS === "web") {
    return;
  }

  if (!rules?.checkin_start || !rules?.checkout_start) {
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

  // Remove both named reminders and anonymous reminders from older app versions.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const reminder of scheduled) {
    if (
      reminder.identifier === CHECKIN_NOTIFICATION_ID ||
      reminder.identifier === CHECKOUT_NOTIFICATION_ID ||
      (reminder.content.title === "Check-in Time ⏰" &&
        reminder.content.body === "Your check-in window has started. Please check in from the HRM app.") ||
      (reminder.content.title === "Check-out Time ⏰" &&
        reminder.content.body === "Workday is ending. Don't forget to check out.")
    ) {
      await Notifications.cancelScheduledNotificationAsync(reminder.identifier);
    }
  }
  // Schedule Check-in Notification
  await Notifications.scheduleNotificationAsync({
    identifier: CHECKIN_NOTIFICATION_ID,
    content: {
      title: "Check-in Time ⏰",
      body: "Your check-in window has started. Please check in from the HRM app.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: "default",
      hour: checkInHour,
      minute: checkInMinute,
    },
  });

  // Schedule Check-out Notification
  await Notifications.scheduleNotificationAsync({
    identifier: CHECKOUT_NOTIFICATION_ID,
    content: {
      title: "Check-out Time ⏰",
      body: "Workday is ending. Don't forget to check out.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      channelId: "default",
      hour: checkOutHour,
      minute: checkOutMinute,
    },
  });

  console.log(
    `Scheduled check-in at ${checkInHour}:${checkInMinute} and check-out at ${checkOutHour}:${checkOutMinute}`,
  );
}
