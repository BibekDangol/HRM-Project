// supabase/functions/delete-leave-type/index.ts
/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const { id } = await req.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: "Leave type ID is required" }),
        { status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error } = await supabase
      .from("leave_types")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Leave type deleted successfully" }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
