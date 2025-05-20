import { Injectable } from '@nestjs/common';
import { DataTypes } from 'sequelize';
import { RDSService } from 'artifacts/rds/rds.service';
import { BaseRepository } from 'artifacts/rds/core/base.repository';

@Injectable()
export class SmsConfigurationRepository extends BaseRepository {

  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'smsConfiguration',
        {
          name: {
            type: DataTypes.STRING,
          },
          service: {
            type: DataTypes.STRING,
          },
          apiKey: {
            type: DataTypes.STRING,
          },
          secretKey: {
            type: DataTypes.STRING,
          },
          sender: {
            type: DataTypes.STRING,
          },
          createdAt: {
            type: DataTypes.DATE,
            defaultValue: Date.now,
          },
          updatedAt: {
            type: DataTypes.DATE,
            defaultValue: Date.now,
          },
        },
        'sms_configurations',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'smsConfiguration';
  }
  getRelationIdName(): string {
    return '';
  }
}
