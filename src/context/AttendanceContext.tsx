import React, { createContext, useContext } from "react";

import { useAttendanceToggle } from "@/src/hooks/users/useAttendanceToggle";

type AttendanceContextType = ReturnType<typeof useAttendanceToggle>;

const AttendanceContext = createContext<AttendanceContextType | null>(null);

export const AttendanceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const value = useAttendanceToggle();
  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendanceContext = () => {
  const ctx = useContext(AttendanceContext);
  if (!ctx)
    throw new Error(
      "useAttendanceContext must be used inside AttendanceProvider",
    );
  return ctx;
};
