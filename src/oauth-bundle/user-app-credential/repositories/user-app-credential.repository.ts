import { Injectable } from '@nestjs/common';
import { DataTypes } from 'sequelize';
import { RDSService } from 'artifacts/rds/rds.service';
import { BaseRepository } from 'artifacts/rds/core/base.repository';

@Injectable()
export class UserAppCredentialRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'userAppCredential',
        {
          id: {
            type: DataTypes.NUMBER,
            primaryKey: true,
            autoIncrement: true,
          },
          appId: {
            type: DataTypes.NUMBER,
          },
          userId: {
            type: DataTypes.NUMBER,
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
        'user_app_credentials',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'userAppCredential';
  }
  getRelationIdName(): string {
    return '';
  }
}
