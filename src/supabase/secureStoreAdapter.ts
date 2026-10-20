import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TAB_KEY = "leave_active_tab";

const isWeb = Platform.OS === "web";

// expo-secure-store has no implementation in the web/SSR (Node) runtime,
// where Supabase auth initializes during static rendering. Calling it there
// throws "getValueWithKeyAsync is not a function" and crashes the web build,
// so web uses localStorage instead.
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.removeItem(key);
  },
};

const nativeStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) =>
    SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const secureStoreAdapter = isWeb ? webStorage : nativeStorage;

export const saveLeaveTab = async (tab: string) => {
  await secureStoreAdapter.setItem(TAB_KEY, tab);
};

export const getLeaveTab = () => {
  return secureStoreAdapter.getItem(TAB_KEY);
};
