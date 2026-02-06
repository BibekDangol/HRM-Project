import { UserProfile } from "@/src/screens/admin/components/UserCard";
import { supabase } from "@/src/supabase/supabaseClient";
import { create } from "zustand";

type AdminProfile = {
  id: string;
  organization_id: number;
};
type UsersState = {
  users: UserProfile[];
  organizationName: string;
  fetchUsers: (searchQuery?: string) => Promise<void>;
  adminProfile: AdminProfile | null;
  fetchAdminProfile: (userId: string) => Promise<void>;
};

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  organizationName: "",
  adminProfile: null,

  fetchAdminProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, organization_id")
        .eq("id", userId)
        .single();
      if (error) {
        console.log("Admin profile fetching error", error);
        return;
      }
      set({ adminProfile: data });
      if (data?.organization_id) {
        get().fetchUsers();
      }
    } catch (err) {
      console.log("Error fetching admin Profile", err);
    }
  },
  fetchUsers: async (searchQuery = "") => {
    const orgId = get().adminProfile?.organization_id;
    if (!orgId) return;
    try {
      let query = supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, email, role, status, organization_id, supervisor_id, organization(name)",
        )
        .eq("organization_id", orgId);
      if (searchQuery.trim()) {
        const q = searchQuery.trim().replace(/\s+/g, " ");
        query = query.or(
          `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%`,
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      set({
        users: data || [],
        organizationName: data?.[0].organization?.name ?? "",
      });
    } catch (err) {
      console.error("Error fetching users", err);
    }
  },
}));
