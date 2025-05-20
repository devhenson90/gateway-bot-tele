import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb';

export class UpdateExpression {
  updateExpression: string;
  expressionAttributeValues: ExpressionAttributeValueMap;
  conditionExpression?: string;
  expressionAttributeNames: {};
}
