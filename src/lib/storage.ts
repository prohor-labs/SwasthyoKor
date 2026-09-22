import "server-only";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION || "garage",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export const BUCKET_NAME =
  process.env.S3_BUCKET ||
  process.env.STORAGE_BUCKET ||
  process.env.NEON_STORAGE_BUCKET ||
  "swasthyokor";

/**
 * Upload a buffer or string to S3 Compatible Object Storage
 */
export async function uploadObject({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);

  // Return public URL
  if (process.env.S3_PUBLIC_URL) {
    const publicUrl = process.env.S3_PUBLIC_URL.replace(/\/$/, "");
    return `${publicUrl}/${key}`;
  }

  const endpoint = (process.env.AWS_ENDPOINT_URL_S3 || "").replace(/\/$/, "");
  return `${endpoint}/${BUCKET_NAME}/${key}`;
}


