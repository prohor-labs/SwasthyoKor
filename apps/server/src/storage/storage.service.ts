import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('AWS_ENDPOINT_URL_S3'),
      region: this.configService.get<string>('AWS_REGION') || 'garage',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
      forcePathStyle: true,
    });

    this.bucketName =
      this.configService.get<string>('S3_BUCKET') ||
      this.configService.get<string>('STORAGE_BUCKET') ||
      'swasthyokor';
  }

  async uploadObject({
    key,
    body,
    contentType,
  }: {
    key: string;
    body: Buffer | Uint8Array | string;
    contentType?: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await this.s3.send(command);

    const s3PublicUrl = this.configService.get<string>('S3_PUBLIC_URL');
    if (s3PublicUrl) {
      return `${s3PublicUrl.replace(/\/$/, '')}/${key}`;
    }

    const endpoint = (this.configService.get<string>('AWS_ENDPOINT_URL_S3') || '').replace(/\/$/, '');
    return `${endpoint}/${this.bucketName}/${key}`;
  }
}
