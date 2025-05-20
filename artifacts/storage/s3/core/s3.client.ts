import * as S3 from 'aws-sdk/clients/s3';
import { S3Bucket } from './s3.bucket';
import { S3File } from './s3.file';

export class S3Client {
  private s3: S3;
  private s3Bucket: S3Bucket;
  private s3File: S3File;
  /**
   * Initiate aws credentials and start init S#
   * @param awsCredentials a credentials from .env
   */
  constructor(awsCredentials: any) {
    this.s3 = new S3({
      accessKeyId: awsCredentials.access_key,
      secretAccessKey: awsCredentials.secret_access_key,
      region: awsCredentials.default_region,
    });

    this.s3Bucket = new S3Bucket(this.s3);
    this.s3File = new S3File(this.s3);
  }

  getS3(): S3 {
    return this.s3;
  }

  getS3Bucket(): S3Bucket {
    return this.s3Bucket;
  }

  getS3File(): S3File {
    return this.s3File;
  }
}
