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
  updateLeaveType: (type: LeaveType) => void;
  removeLeaveType: (id: string) => void;
};

export const useLeaveTypeStore = create<LeaveTypeState>((set) => ({
  leaveTypes: [],

  setLeaveTypes: (leaveTypes) => set({ leaveTypes }),

  addLeaveType: (type) =>
    set((state) => ({
      leaveTypes: [...state.leaveTypes, type],
    })),

  updateLeaveType: (updatedType) =>
    set((state) => ({
      leaveTypes: state.leaveTypes.map((type) =>
        type.id === updatedType.id ? updatedType : type,
      ),
    })),

  removeLeaveType: (id) =>
    set((state) => ({
      leaveTypes: state.leaveTypes.filter((type) => type.id !== id),
    })),
}));
