import { Injectable } from '@nestjs/common';
import DynamoDB, { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoClient } from './dynamo.client';
import { UpdateExpression } from './update-expression.model';

@Injectable()
export abstract class DynamoRepository {
  private table: string;
  private attributes: string[];
  abstract init(): DynamoDB.CreateTableInput;
  constructor(private readonly dynamoClient: DynamoClient) { }

  async read(key: any): Promise<DocumentClient.GetItemOutput> {
    const params = {
      TableName: this.table,
      Key: key,
    };

    const a = await this.dynamoClient.getDocClient().get(params).promise();
    return a.$response.data['Item'] as DocumentClient.GetItemOutput;
  }

  async readItem(key: any): Promise<any> {
    const params = {
      TableName: this.table,
      Key: key,
    };

    const a = await this.dynamoClient.getDocClient().get(params).promise();
    return a.$response.data['Item'];

  }

  async readByUuids(keys: any): Promise<DocumentClient.ItemList> {
    const params: DocumentClient.BatchGetItemInput = {
      RequestItems: {
        [this.table]: {
          Keys: keys,
        },
      },
    };
    const a = await this.dynamoClient.getDocClient().batchGet(params).promise();

    return a.Responses ? a.Responses[this.table] : [];
  }

  async save(data: any): Promise<DocumentClient.PutItemOutput> {
    const params = {
      TableName: this.table,
      Item: data,
    };

    const a = await this.dynamoClient.getDocClient().put(params).promise();
    return a.$response.data as DocumentClient.PutItemOutput;
  }

  async update(
    key: any,
    expression: UpdateExpression,
  ): Promise<DocumentClient.UpdateItemOutput> {
    const params = {
      TableName: this.table,
      Key: key,
      UpdateExpression: expression.updateExpression,
      ExpressionAttributeNames: expression.expressionAttributeNames,
      ExpressionAttributeValues: expression.expressionAttributeValues,
      ConditionExpression: expression.conditionExpression,
      ReturnValues: 'UPDATED_NEW',
    };
    console.log("params:::==>", JSON.stringify(params));

    const a = await this.dynamoClient.getDocClient().update(params).promise();
    return a.$response.data as DocumentClient.UpdateItemOutput;
  }

  async updateIndex(
    key: any,
    expression: UpdateExpression,
  ): Promise<DocumentClient.UpdateItemOutput> {
    const params = {
      TableName: this.table,
      Key: key,
      UpdateExpression: expression.updateExpression,
      ExpressionAttributeNames: expression.expressionAttributeNames,
      ExpressionAttributeValues: expression.expressionAttributeValues,
      ConditionExpression: expression.conditionExpression,
      ReturnValues: 'UPDATED_NEW',
    };
    console.log("params:::==>", JSON.stringify(params));

    const a = await this.dynamoClient.getDocClient().update(params).promise();
    return a.$response.data as DocumentClient.UpdateItemOutput;
  }

  async delete(key: any): Promise<DocumentClient.DeleteItemOutput> {
    const params = {
      TableName: this.table,
      Key: key,
    };

    const a = await this.dynamoClient.getDocClient().delete(params).promise();
    return a.$response.data as DocumentClient.DeleteItemOutput;
  }

  createTable(params: DynamoDB.CreateTableInput) {
    return this.dynamoClient
      .getClient()
      .createTable(params, function (err, data) {
        if (err) {
          if (err.code === 'ResourceInUseException') {
            console.log(params.TableName);
          } else {
            console.error(
              'Unable to create table. Error JSON:',
              JSON.stringify(err, null, 2),
            );
          }
        } else {
          console.log(
            'Created table. Table description JSON:',
            JSON.stringify(data, null, 2),
          );
        }
      });
  }

  getAttributes(attributes: string[]) {
    this.attributes = attributes;
    return this;
  }

  getClient() {
    return this.dynamoClient.getDocClient();
  }

  getTable() {
    return this.table;
  }

  onModuleInit() {
    this.table = this.init().TableName;
    // this.createTable(this.init());
  }
}
