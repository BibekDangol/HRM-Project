import { useLeaveTabStore } from "@/src/store/useLeaveTabStore";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import AdminLeaveQueue from "./AdminLeaveQueue";

export default function AdminLeaveScreen() {
  const reset = useLeaveTabStore((s) => s.reset);

  useFocusEffect(
    useCallback(() => {
      reset();
    }, [reset]),
  );

  return <AdminLeaveQueue />;
}
