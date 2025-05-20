import S3 from 'aws-sdk/clients/s3';
import { BadRequestException } from '@nestjs/common';

export class S3File {
  private s3: S3;

  constructor(s3: S3) {
    this.s3 = s3;
  }

  async createReadStreamObject(params: any) {
    let file;
    try {
      file = await this.s3.getObject(params);
    } catch (error) {
      throw new BadRequestException(error);
    }
    return file.createReadStream().on('error', (error) => {
      console.log(params, error);
      // Catching NoSuchKey & StreamContentLengthMismatch
    });
  }

  async createReadStremObject(params: any) {
    try {
      const exists = await this.s3.headObject(params)
      .promise()
      if (exists) {
        return this.s3.getObject(params).createReadStream();
      }
      return {status: "NotFound"};
    } catch (error) {
      console.error("ERROR = ",error);
      return error
    }
  }

  async getObject(params: any) {
    return new Promise((resolve, reject) => {
      this.s3.getObject(params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }

  async generateReadURL(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl('getObject', params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve({
          readURL: data,
          key: params.Key,
        });
      });
    });
  }

  async generateUploadURL(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.getSignedUrl('putObject', params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve({
          uploadURL: data,
          key: params.Key,
        });
      });
    });
  }

  upload(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve(data);
      });
    });
  }

  uploads(params: any[]): Promise<any> {
    const promises: Promise<any>[] = [];
    for (let i = 0; i < params.length; i++) {
      promises.push(this.s3.upload(params[i]).promise());
    }
    return Promise.all(promises);
  }

  delete(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.s3.deleteObject(params, (err, data) => {
        if (err) {
          // console.log(err, err.stack);
          reject(JSON.stringify(err, null, 2));
        }
        resolve({status:"ok",data:data});
      });
    });
  }

  async getObjectContentLength(params: any): Promise<number> {
    try {
      const headData = await this.s3.headObject(params).promise();
      return headData.ContentLength;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
