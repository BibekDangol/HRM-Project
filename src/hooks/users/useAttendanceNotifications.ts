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
    let cancelled = false;
    const init = async () => {
      try {
        const rules = await getAttendanceRulesService();
        if (cancelled) return;
        setAttendanceRules(rules);
        const permitted = await registerForPushNotificationsAsync();
        if (!cancelled && permitted) await scheduleAttendanceNotifications(rules);
      } catch (error) {
        console.warn("Attendance notification initialization failed:", error);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  return { attendanceRules };
}
