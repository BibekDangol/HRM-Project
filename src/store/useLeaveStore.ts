import { Leave, LeaveStatus } from '@/src/services/leave.service';

import { create } from 'zustand';

type LeaveState = {
  leaves: Leave[];
  setLeaves: (leaves: Leave[]) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus) => void;
};

export const useLeaveStore = create<LeaveState>((set) => ({
  leaves: [],
  setLeaves: (leaves) => set({ leaves }),
  updateLeaveStatus: (id, status) =>
    set((state) => ({
      leaves: state.leaves.map((l) => (l.id === id ? { ...l, status } : l)),
    })),
}));
