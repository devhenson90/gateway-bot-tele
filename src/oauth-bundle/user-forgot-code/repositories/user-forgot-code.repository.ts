import { Injectable } from '@nestjs/common';
import { DataTypes } from 'sequelize';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';

@Injectable()
export class UserForgotCodeRepository extends BaseRepository {

  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'userForgotCode',
        {
          id: {
            type: DataTypes.NUMBER,
            primaryKey: true,
            autoIncrement: true
          },
          forgotType: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          forgotMethod: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          code: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          userId: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          expiredReason: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          expiredAt: {
            type: DataTypes.DATE,
            allowNull: false,
          },
          usedAt: {
            type: DataTypes.DATE,
            allowNull: true,
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
        'user_forgot_codes',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'userForgotCode';
  }
  getRelationIdName(): string {
    return '';
  }
}
