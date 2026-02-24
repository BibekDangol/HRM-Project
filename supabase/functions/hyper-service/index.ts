import { createClient, } from "@supabase/supabase-js";

Deno.serve(async (req: Request) => {
  try {
    /* --------------------------------------------------
       1️⃣ AUTHORIZATION CHECK (optional)
       You can check if the request has a valid admin token
    -------------------------------------------------- */
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // Optional: verify token using anon key
    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    /* --------------------------------------------------
       2️⃣ PARSE REQUEST BODY
    -------------------------------------------------- */
    const { name, leave_limit } = await req.json();
    if (!name || leave_limit === undefined) {
      return new Response(JSON.stringify({ error: "Name and limit required" }), { status: 400 });
    }

    const limitNumber = Number(leave_limit);
    if (isNaN(limitNumber) || limitNumber < 0) {
      return new Response(JSON.stringify({ error: "Leave limit must be positive number" }), { status: 400 });
    }

    /* --------------------------------------------------
       3️⃣ INSERT INTO leave_types TABLE
       Using Service Role key
    -------------------------------------------------- */
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optional: check if leave type already exists
    const { data: existing } = await supabaseAdmin
      .from("leave_types")
      .select("*")
      .eq("name", name.trim());

    if (existing?.length) {
      return new Response(JSON.stringify({ error: "Leave type already exists" }), { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("leave_types")
      .insert([{ name: name.trim(), leave_limit: limitNumber }])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
