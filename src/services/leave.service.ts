import { supabase } from "../supabase/supabaseClient";

export type LeaveStatus = "pending" | "approved" | "rejected";

export type Leave = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  leave_type: string;
  status: LeaveStatus;
  first_name: string;
  last_name: string;
  approved_by_name?: string;
};

// Fetch all leave requests for an org
export async function fetchLeaveRequests(orgId: number): Promise<Leave[]> {
  const { data, error } = await supabase
    .from("leaves")
    .select(
      `id,user_id,start_date,end_date,leave_type,status,user_profile:profiles!leaves_user_id_fkey(first_name,last_name),
      approved_profile:profiles!leaves_approved_by_fkey(first_name,last_name)`,
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Map Supabase nested profile to flat first_name / last_name
  return data.map((d: any) => ({
    ...d,
    first_name: d.user_profile?.first_name,
    last_name: d.user_profile?.last_name,
    approved_by_name: d.approved_profile
      ? `${d.approved_profile.first_name} ${d.approved_profile.last_name}`
      : null,
  }));
}

// Fetch a single leave by id
export async function fetchLeaveById(id: string) {
  const { data, error } = await supabase
    .from("leaves")
    .select(
      `*, user_profile:profiles!leaves_user_id_fkey(first_name,last_name),
       approved_profile:profiles!leaves_approved_by_fkey(first_name,last_name)`,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    ...data,
    first_name: data.user_profile?.first_name,
    last_name: data.user_profile?.last_name,
    approved_by_name: data.approved_profile
      ? `${data.approved_profile.first_name} ${data.approved_profile.last_name}`
      : null,
  };
}

// Update leave status
export async function updateLeaveStatus(id: string, status: LeaveStatus) {
  const { error } = await supabase
    .from("leaves")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function countUserLeaves(userId: string, leaveType: string) {
  const { data, error } = await supabase
    .from("leaves")
    .select("id", { count: "exact" })
    //I want the total number of rows that match this query exactly.
    .eq("user_id", userId)
    //only count for the clicked user
    .eq("leave_type", leaveType)
    //only fetch count for annual type || sick type-> whatever type you select
    .in("status", ["approved", "pending"]);
  //status is one of these values-> either approved or pending for that counting
  if (error) throw error;
  return data ? data.length : 0;
  //data is array of rows, if data exists return data.length-> counts number of leaves
  //if data doesnot exist return 0
}
