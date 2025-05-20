import S3 from 'aws-sdk/clients/s3';

export class S3Bucket {
  private s3: S3;

  constructor(s3: S3) {
    this.s3 = s3;
  }

  listBuckets(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.listBuckets(function (err, data) {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }

  createBucket(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.createBucket(params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }

  deleteBucket(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.deleteBucket(params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }

  listObjects(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.listObjects(params, function (err, data) {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }
}
