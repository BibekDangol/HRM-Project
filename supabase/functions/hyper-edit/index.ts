import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";


serve(async(req:Request)=>{
  if (req.method !== "POST") {
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405 }
  );
}
  try{
    const authHeader= req.headers.get("Authorization");
    if(!authHeader){
      return new Response(
        JSON.stringify({error:"Unauthorized: missing token"}),
        {status:401}
      );
    }

    const token= authHeader.replace("Bearer ", "");
   const supabaseAuth = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      auth:{persistSession:false},
    }
   );

   const{
    data:{user},
    error: authError,
  
   }= await supabaseAuth.auth.getUser(token);

   if(authError || !user){
    return new Response(
      JSON.stringify({error:"Unauthorized: invalid token"}),
      {status: 401}
    );
   }

   const body = await req.json();
   const {userId, role, supervisor_id}= body;

   if(!userId || !role){
    return new Response (JSON.stringify({success: false, error:"Missing parameters"}),
    {
      status:400,
      headers:{"content-Type": "application/json"},
    });
   }

   const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

   const {data, error}= await supabase
   .from("profiles")
   .update({role,supervisor_id})
   .eq("id",userId)
   .select()
   .single();

   if(error){
    return new Response(JSON.stringify({success:false, error:error.message}),
    {
      status:500,
      headers:{'Content-Type':'application/json'},
    });
   }

   return new Response(JSON.stringify({success: true, data}),{
    status:200,
    headers:{"Content-Type":"application/json"}
   });

  }
  catch(err: any){
  return new Response(
    JSON.stringify({error: err.message || "Internal server error"}),{
      status:500,
      headers:{"Content-Type": "application/json"},
    });
  }
});