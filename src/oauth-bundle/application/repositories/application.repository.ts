import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';
import { DataTypes } from 'sequelize';

@Injectable()
export class ApplicationRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'application',
        {
          adminConsoleId: {
            type: DataTypes.INTEGER,
          },
          name: {
            type: DataTypes.STRING,
          },
          description: {
            type: DataTypes.STRING,
          },
          clientId: {
            type: DataTypes.STRING,
          },
          clientSecret: {
            type: DataTypes.STRING,
          },
          redirectUri: {
            type: DataTypes.STRING,
          },
          callbackUri: {
            type: DataTypes.STRING,
          },
          status: {
            type: DataTypes.STRING,
          },
          smsConfigurationId: {
            type: DataTypes.NUMBER,
          },
          verifyAccountName: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
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
        'applications',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'application';
  }

  getRelationIdName(): string {
    return '';
  }
}
