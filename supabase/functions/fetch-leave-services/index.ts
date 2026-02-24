// Setup type definitions for built-in Supabase Runtime APIs
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client inside Edge Function
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

export type LeaveStatus = "pending" | "approved" | "rejected";

serve(async (req) => {
  try {
    const { action, payload } = await req.json();

    switch (action) {
      // Fetch all leave requests for an organization
      case "fetchLeaveRequests": {
        const { orgId } = payload;
        const { data, error } = await supabase
          .from("leaves")
          .select(
            `id,user_id,start_date,end_date,leave_types(id,name,leave_limit),status,
             user_profile:profiles!leaves_user_id_fkey(first_name,last_name),
             action_profile:profiles!leaves_action_taken_by_fkey(first_name,last_name)`
          )
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const result = data.map((d: any) => ({
          ...d,
          status: d.status ?? "pending",
          first_name: d.user_profile?.first_name,
          last_name: d.user_profile?.last_name,
          action_taken_by_name: d.action_profile
            ? `${d.action_profile.first_name} ${d.action_profile.last_name}`
            : null,
          leave_type_id: d.leave_types?.id ?? null,
          leave_type_name: d.leave_types?.name ?? null,
          leave_limit: d.leave_types?.leave_limit ?? 0,
        }));

        return Response.json({ leaves: result });
      }

      // Fetch a single leave by ID
      case "fetchLeaveById": {
        const { id } = payload;
        const { data, error } = await supabase
          .from("leaves")
          .select(
            `*,leave_types(id,name,leave_limit),
             user_profile:profiles!leaves_user_id_fkey(first_name,last_name),
             action_profile:profiles!leaves_action_taken_by_fkey(first_name,last_name)`
          )
          .eq("id", id)
          .single();

        if (error) throw error;

        const result = {
          ...data,
          first_name: data.user_profile?.first_name,
          last_name: data.user_profile?.last_name,
          action_taken_by_name: data.action_profile
            ? `${data.action_profile.first_name} ${data.action_profile.last_name}`
            : null,
          leave_type_id: data.leave_types?.id ?? null,
          leave_type_name: data.leave_types?.name ?? null,
          leave_limit: data.leave_types?.leave_limit ?? 0,
        };

        return Response.json({ data: result });
      }

      // Update leave status
      case "updateLeaveStatus": {
        const { id, status, userId } = payload as {
          id: string;
          status: LeaveStatus;
          userId: string;
        };
 

        const updateData: any = { status };
        // Add action_taken_by when approving or rejecting
        if (status === "approved" || status === "rejected") {
          updateData.action_taken_by = userId;

        }
        const { data, error } = await supabase
          .from("leaves")
          .update(updateData)
          .eq("id", id);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 400 });
        }

        return new Response(JSON.stringify({ message: "Status updated successfully" }), { status: 200 });
      }

      // Sum used leave days
      case "sumUserLeaveDaysByType": {
        const { userId, leaveTypeId } = payload;
        const { data, error } = await supabase
          .from("leaves")
          .select("days_count", { count: "exact" })
          .eq("user_id", userId)
          .eq("leave_type_id", leaveTypeId)
          .in("status", ["approved", "pending"]);

        if (error) throw error;

        const total = data?.reduce((sum, row: any) => sum + (row.days_count || 0), 0) ?? 0;

        return Response.json({ total });
      }

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});
