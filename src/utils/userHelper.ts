// import {AdminProfile} from "@/app/(admin)/(main-tabs)/manage-users";
// import { UserProfile } from "@/app/(admin)/(main-tabs)/manage-users";
// import { supabase } from "@/supabase/supabaseClient";

// export const fetchAdminProfile = async (userId: string) => {
//   const { data, error } = await supabase
//     .from("profiles")
//     .select("id, organization_id")
//     .eq("id", userId)
//     .single();

//   if (error) {
//     console.log("Admin profile fetching error", error);
//     return null;
//   }

// return data;
// };

// export const fetchUsers = async (userId: string, adminOrgId: number) => {
//   const { data, error } = await supabase
//     .from("profiles")
//     .select(`*, organization(name)`)
//     .eq("organization_id", adminOrgId)
//     .neq("id", userId); // exclude admin himself

//   if (error) {
//     console.log("Fetch users error:", error);
//     return { allUsers: [], pendingUsers: [], activeUsers: [], orgName: "" };
//   }

//   if (!data || data.length === 0) {
//     return { allUsers: [], pendingUsers: [], activeUsers: [], orgName: "" };
//   }

//   const pendingUsers = data.filter((u: UserProfile) => u.status === "pending");
//   const activeUsers = data.filter((u: UserProfile) => u.status === "active");

//   const orgName = data[0].organization?.name ?? "";

//   return { allUsers: data as UserProfile[], pendingUsers, activeUsers, orgName };
// };