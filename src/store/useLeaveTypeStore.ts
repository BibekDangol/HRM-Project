import { create } from "zustand";

export type LeaveType = {
  id: string;
  name: string;
  leave_limit: number;
};

type LeaveTypeState = {
  leaveTypes: LeaveType[];
  setLeaveTypes: (types: LeaveType[]) => void;
  addLeaveType: (type: LeaveType) => void;
};

export const useLeaveTypeStore = create<LeaveTypeState>((set) => ({
  leaveTypes: [],
  setLeaveTypes: (leaveTypes) => set({ leaveTypes }),
  addLeaveType: (type) =>
    set((state) => ({
      leaveTypes: [...state.leaveTypes, type],
    })),
}));
