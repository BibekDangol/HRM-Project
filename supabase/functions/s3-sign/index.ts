// supabase/functions/s3-edge/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MINIO_HOST = Deno.env.get("S3_ENDPOINT")!; // e.g., 192.168.50.104
const MINIO_ACCESS_KEY = Deno.env.get("ACCESS_KEY")!;
const MINIO_SECRET_KEY = Deno.env.get("SECRET_KEY")!;
const BUCKET = "techhaus-hrm";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    // 1️⃣ Validate method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Parse FormData
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return new Response(JSON.stringify({ error: "No file received." }), { status: 400 });
    }

    // 3️⃣ Validate file type & size
    if (!file.type.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only image files are allowed." }), { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large. Max 5MB allowed." }), { status: 400 });
    }

    // 4️⃣ Convert file to Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const fileName = `img-${Date.now()}.jpg`;

    // 5️⃣ Upload to MinIO using Deno fetch (S3 PUT)
    const minioUrl = `${MINIO_HOST}/${BUCKET}/${fileName}`;
    const auth = "Basic " + btoa(`${MINIO_ACCESS_KEY}:${MINIO_SECRET_KEY}`);

    const minioResponse = await fetch(minioUrl, {
      method: "PUT",
      headers: {
        "Authorization": auth,
        "Content-Type": file.type,
      },
      body: buffer, // Uint8Array works as body in Deno
    });

    if (!minioResponse.ok) {
      const text = await minioResponse.text();
      console.error("MinIO upload failed:", text);
      return new Response(
        JSON.stringify({ error: "Failed to upload file to storage.", details: text }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const fileUrl = `http://${MINIO_HOST}:${MINIO_PORT}/${BUCKET}/${fileName}`;

    // 6️⃣ Save file URL to Supabase DB
    const { error: dbError } = await supabase.from("images").insert({ url: fileUrl });
    if (dbError) {
      console.error("Supabase DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to save file info to database." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    console.log("Successfull")

    // 7️⃣ Return success
    return new Response(
      JSON.stringify({ success: true, fileUrl }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Unexpected error:", e);
    return new Response(
      JSON.stringify({ error: "Internal server error.", details: e.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});