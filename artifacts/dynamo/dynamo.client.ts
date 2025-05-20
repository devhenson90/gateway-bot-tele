import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class DynamoClient {
  private dynamodb: AWS.DynamoDB;
  private dynamodbDocClient: AWS.DynamoDB.DocumentClient;

  constructor(private configService: ConfigService) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_CREDENTIALS').access_key,
      secretAccessKey: this.configService.get('AWS_CREDENTIALS').secret_access_key,
      region: this.configService.get('AWS_CREDENTIALS').default_region,
    });

    this.dynamodb = new AWS.DynamoDB();
    this.dynamodbDocClient = new AWS.DynamoDB.DocumentClient();
  }

  public getClient(): AWS.DynamoDB {
    return this.dynamodb;
  }

  public getDocClient(): AWS.DynamoDB.DocumentClient {
    return this.dynamodbDocClient;
  }
}
