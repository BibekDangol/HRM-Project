import { create } from "zustand";
import { userProfile } from "../services/currentuser.service";
import { UserProfile } from "../types/admin";

type UsersState = {
  users: UserProfile[];
  organizationName: string;
  setUserProfile: (profile: userProfile) => void;
  setUsers: (users: UserProfile[]) => void;
  userProfile: userProfile | null;
};

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  organizationName: "",
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),

  setUsers: (users) =>
    set({
      users,
      organizationName: users?.[0]?.organization?.name ?? "",
    }),
}));
