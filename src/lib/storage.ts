import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.AWS_ENDPOINT_URL_S3;
const region = process.env.AWS_REGION || "us-east-2";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName =
  process.env.S3_BUCKET || process.env.STORAGE_BUCKET || "swasthyokor";

const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true,
});

export async function uploadObject({
  key,
  body,
  contentType,
}: {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType?: string;
}): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3.send(command);

  const s3PublicUrl = process.env.S3_PUBLIC_URL;
  if (s3PublicUrl) {
    return `${s3PublicUrl.replace(/\/$/, "")}/${key}`;
  }

  const baseEndpoint = (endpoint || "").replace(/\/$/, "");
  return `${baseEndpoint}/${bucketName}/${key}`;
}
