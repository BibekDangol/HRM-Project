import { useAuthStore } from "@/src/store/useAuthStore";
import { useRouter } from "expo-router";
import { useState } from "react";

export function useAdminHeaderMenu() {
  const router = useRouter();
  const signOut = useAuthStore(s => s.signOut);
  const [open, setOpen] = useState(false);

  const logout = async () => {
    setOpen(false);
    await signOut();
    router.replace("/(auth)/login");
  };

  return {
    open,
    toggle: () => setOpen(v => !v),
    close: () => setOpen(false),
    logout,
  };
}
