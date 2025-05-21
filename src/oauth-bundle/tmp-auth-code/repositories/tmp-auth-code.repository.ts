import { Injectable } from '@nestjs/common';
import { DataTypes, Model, ModelStatic } from 'sequelize';
import { RDSService } from 'artifacts/rds/rds.service';
import { BaseRepository } from 'artifacts/rds/core/base.repository';

@Injectable()
export class TMPAuthCodeRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'tmpAuthCode',
        {
          userId: {
            type: DataTypes.INTEGER,
          },
          appId: {
            type: DataTypes.INTEGER,
          },
          code: {
            type: DataTypes.STRING,
          },
          csrf: {
            type: DataTypes.STRING,
          },
          status: {
            type: DataTypes.STRING,
          },
          encryptedAuthData: {
            type: DataTypes.STRING,
          },
          authToken: {
            type: DataTypes.JSON,
          },
          grantType: {
            type: DataTypes.STRING,
          },
          expiredAt: {
            type: DataTypes.DATE,
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
        'tmp_auth_codes',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'tmpAuthCode';
  }

  getRelationIdName(): string {
    return '';
  }
}
