import { supabase } from "../supabase/supabaseClient";

export type ImageState = {
  signedUrl: string;
  error?: string;
};
/**
 * Fetch signed URL for a specific image in the "profile_images" bucket
 * @param path Path of the image in the bucket, e.g., "folder/profile-image.png"
 * @param expiresIn Expiry time in seconds (default 60s)
 */
export async function fetchImageService(
  path: string,
  expiresIn = 60,
): Promise<ImageState> {
  try {
    const { data, error } = await supabase.storage
      .from("profile_images")
      .createSignedUrl(path, expiresIn);
    if (error) {
      return { signedUrl: "", error: error.message };
    }
    console.log(data);
    return { signedUrl: data.signedUrl };
  } catch (err: any) {
    return { signedUrl: "", error: err.message || "Unknown error" };
  }
}
