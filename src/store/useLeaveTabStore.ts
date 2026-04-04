import { create } from "zustand";
import { LeaveStatus } from "../services/leave.service";

type LeaveTabStore = {
  activeTab: LeaveStatus;
  setActiveTab: (tab: LeaveStatus) => void;
  reset: () => void;
};

export const useLeaveTabStore = create<LeaveTabStore>((set) => ({
  activeTab: "pending",
  setActiveTab: (tab) => set({ activeTab: tab }),
  reset: () => set({ activeTab: "pending" }),
}));
