import { Injectable } from '@nestjs/common';
import { DataTypes, Model, ModelStatic } from 'sequelize';
import { RDSService } from 'artifacts/rds/rds.service';
import { BaseRepository } from 'artifacts/rds/core/base.repository';

@Injectable()
export class AdminConsoleRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'adminConsole',
        {
          email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          password: {
            type: DataTypes.STRING,
          },
          avatar: {
            type: DataTypes.STRING,
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          lastLoginAt: {
            type: DataTypes.DATE,
          },
          lastActiveAt: {
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
        'admin_consoles',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'adminConsole';
  }

  getRelationIdName(): string {
    return '';
  }
}
