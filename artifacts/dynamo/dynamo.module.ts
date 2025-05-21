import { Module } from '@nestjs/common';
import { DynamoClient } from './dynamo.client';

@Module({
    providers: [DynamoClient], 
    exports: [DynamoClient], 
})
export class DynamoModule {}
