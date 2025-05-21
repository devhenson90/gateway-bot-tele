import { Injectable } from '@nestjs/common';
import { DataTypes, Model, ModelStatic } from 'sequelize';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';

@Injectable()
export class RoleRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'role',
        {
          applicationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          status: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          type: {
            type: DataTypes.STRING,
            allowNull: false,
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
        'roles',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'role';
  }

  getRelationIdName(): string {
    return '';
  }
}
