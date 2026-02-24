import { apiClient } from "@/src/api/apiClient";

export async function getUploadUrlService(
  filename: string,
  contentType: string
) {
  const res = await apiClient.post("/generate-upload-url", {
    filename,
    contentType,
  });

  return res.data.url;
}