import { create } from "zustand";
import { UserProfile } from "../types/admin";

type AdminProfile = {
  id: string;
  organization_id: number;
};
type UsersState = {
  users: UserProfile[];
  organizationName: string;
  setAdminProfile: (profile: AdminProfile) => void;
  setUsers: (users: UserProfile[]) => void;
  adminProfile: AdminProfile | null;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  organizationName: "",
  adminProfile: null,
  setAdminProfile: (profile) => set({ adminProfile: profile }),

  setUsers: (users) =>
    set({
      users,
      organizationName: users?.[0]?.organization?.name ?? "",
    }),
}));
