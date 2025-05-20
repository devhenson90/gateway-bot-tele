import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';
import { DataTypes } from 'sequelize';

@Injectable()
export class UserRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'user',
        {
          adminConsoleId: {
            type: DataTypes.INTEGER,
          },
          username: {
            type: DataTypes.STRING,
          },
          email: {
            type: DataTypes.STRING,
          },
          phone: {
            type: DataTypes.STRING,
          },
          password: {
            type: DataTypes.STRING,
          },
          pinCode: {
            type: DataTypes.STRING,
          },
          accessKeyId: {
            type: DataTypes.STRING,
          },
          secretAccessKeyId: {
            type: DataTypes.STRING,
          },
          status: {
            type: DataTypes.STRING,
          },
          secretExpiredAt: {
            type: DataTypes.DATE,
          },
          lastLoginAt: {
            type: DataTypes.DATE,
          },
          lastActiveAt: {
            type: DataTypes.DATE,
          },
          originAppId: {
            type: DataTypes.NUMBER,
            defaultValue: 1,
          },
          isFirstLogin: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
          },
          lastUpdatedPassword: {
            type: DataTypes.DATE,
          },
          isMfaVerification: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          isMfaEnabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          },
          twoFactorSecret: {
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
          deletedAt: {
            type: DataTypes.DATE,
          },
        },
        'users',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'user';
  }

  getRelationIdName(): string {
    return '';
  }
}
