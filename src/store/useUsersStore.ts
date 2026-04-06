import { create } from "zustand";
import { CurrentUserProfile } from "../services/currentuser.service";
import { UserProfile } from "../types/admin";

export type UsersState = {
  currentUserProfile: CurrentUserProfile | null;
  setCurrentUserProfile: (profile: CurrentUserProfile) => void;

  selectedUserProfile: UserProfile | null;
  setSelectedUserProfile: (profile: UserProfile | null) => void;

  users: UserProfile[];
  setUsers: (users: UserProfile[]) => void;

  organizationName: string;
};

export const useUsersStore = create<UsersState>((set) => ({
  currentUserProfile: null,
  selectedUserProfile: null,
  users: [],
  organizationName: "",

  setCurrentUserProfile: (profile) => set({ currentUserProfile: profile }),
  setSelectedUserProfile: (profile) => set({ selectedUserProfile: profile }),

  setUsers: (users) =>
    set({
      users,
      organizationName: users?.[0]?.organization?.name ?? "",
    }),
}));
