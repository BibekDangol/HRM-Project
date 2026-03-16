import {
  registerForPushNotificationsAsync,
  scheduleAttendanceNotifications,
} from "../services/attendanceNotification.service";

import { useEffect } from "react";

export function useAttendanceNotifications() {
  useEffect(() => {
    const init = async () => {
      await registerForPushNotificationsAsync();
      await scheduleAttendanceNotifications();
    };

    init();
  }, []);
}