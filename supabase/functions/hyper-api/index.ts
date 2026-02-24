import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Entry point
serve(async (req: Request) => {
  try {
    //1. Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: missing token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
 console.log("token", token);
    // 2. Create a Supabase client with anon key to validate JWT
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        auth:{
          persistSession:false,
        }
      }
    );
    //get user from authorization header i.e. handled by client 
   const {data:{user}, error:userError}= await supabaseClient.auth.getUser(token);
  console.log(user, userError);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // // 3. Check if user is admin (assuming you store role in metadata)
    // const role = userData.user.user_metadata?.role;
    // if (role !== "admin") {
    //   return new Response(
    //     JSON.stringify({ error: "Forbidden: admin only" }),
    //     { status: 403, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    
    // const { secret } = await req.json();

    // if (!secret || secret !== Deno.env.get("DELETE_USER_SECRET")) {
    //   return new Response(
    //     JSON.stringify({ error: "Unauthorized" }),
    //     { status: 401, headers: { "Content-Type": "application/json" } }
    //   );
    // }

    // 4. Parse body for userId to delete
    const { userId } = await req.json();
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Create admin client (service role key) to delete user
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if(user !==null ){ 
      
     const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );


  
    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    }
    // 6. Success
    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
