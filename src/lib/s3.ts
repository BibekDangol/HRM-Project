import {
  MINIO_ACCESS_KEY,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_SECRET_KEY,
} from "../constants/env";
import AWS from "aws-sdk";
/* 🔴 Create S3 Client */
export const s3 = new AWS.S3({
  accessKeyId: MINIO_ACCESS_KEY,
  secretAccessKey: MINIO_SECRET_KEY,
  endpoint: `http://${MINIO_ENDPOINT}:${MINIO_PORT}`,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});
