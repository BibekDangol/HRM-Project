import {
  registerForPushNotificationsAsync,
  scheduleAttendanceNotifications,
} from "../../services/users/attendanceNotification.service";
import { useEffect, useState } from "react";

import { getAttendanceRulesService } from "../../services/users/attendance.service";
import { AttendanceRules } from "@/src/types/attendance";

export function useAttendanceNotifications() {
  const [attendanceRules, setAttendanceRules] =
    useState<AttendanceRules | null>(null);

  useEffect(() => {
    const init = async () => {
      await registerForPushNotificationsAsync();
      const rules = await getAttendanceRulesService();
      setAttendanceRules(rules);
      await scheduleAttendanceNotifications(rules);
    };

    init();
  }, []);

  return { attendanceRules };
}
