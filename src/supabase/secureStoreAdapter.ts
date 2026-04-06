import * as SecureStore from "expo-secure-store";

const TAB_KEY = "leave_active_tab";

export const saveLeaveTab = async (tab: string) => {
  await SecureStore.setItemAsync(TAB_KEY, tab);
};

export const getLeaveTab = async () => {
  return await SecureStore.getItemAsync(TAB_KEY);
};
export const secureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};
