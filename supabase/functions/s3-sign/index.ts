import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

serve(async (req) => {
  try {
    const { filename, contentType } = await req.json();
console.log(filename, contentType)
console.log(Deno.env.get("SECRET_KEY")!)
console.log(Deno.env.get("S3_ENDPOINT")!)
console.log(Deno.env.get("ACCESS_KEY")!)
    const s3 = new S3Client({
      region: "us-east-1",
      endpoint: Deno.env.get("S3_ENDPOINT"),
      credentials: {
        accessKeyId: Deno.env.get("ACCESS_KEY")!,
        secretAccessKey: Deno.env.get("SECRET_KEY")!,
      },
      forcePathStyle: true, // REQUIRED for MinIO
    });

    const command = new PutObjectCommand({
      Bucket: Deno.env.get("S3_BUCKET"),
      Key: filename,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60, // 1 minute
    });

    return new Response(
      JSON.stringify({ url: signedUrl }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});