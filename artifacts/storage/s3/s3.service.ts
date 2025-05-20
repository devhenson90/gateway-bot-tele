import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fileType from 'file-type';
import { MinioClient } from './core/minio.client';
import { S3Client } from './core/s3.client';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private minioClient: MinioClient;
  private s3BucketName: string;

  constructor(private configService: ConfigService) {
    if (this.getIsLocal()) {
      const awsCredentials: any = this.getConfiguration();
      this.minioClient = new MinioClient({
        endpoint: awsCredentials.default_region,
        credentials: {
          accessKeyId: awsCredentials.access_key,
          secretAccessKey: awsCredentials.secret_access_key,
        },
        s3ForcePathStyle: true,
      });
    } else {
      this.s3Client = new S3Client(this.getConfiguration());
    }

    this.s3BucketName = this.configService.get('S3_UPLOAD_BUCKET')
  }

  getConfiguration(): string {
    return this.configService.get('AWS_CREDENTIALS');
  }

  getIsLocal(): boolean {
    return this.configService.get('IS_LOCAL') === 'true';
  }

  getS3Client(): S3Client | MinioClient {
    if (this.getIsLocal()) {
      return this.minioClient;
    }
    return this.s3Client;
  }

  getS3BucketName(): string {
    return this.s3BucketName;
  }

  async getFileExtensionFromBuffer(file: any) {
    return await fileType.fromBuffer(file);
  }
}
