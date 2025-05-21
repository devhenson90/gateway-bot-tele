import { Injectable } from '@nestjs/common';
import { DataTypes } from 'sequelize';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';

@Injectable()
export class UserRoleRelationRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'userRole',
        {
          userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          roleId: {
            type: DataTypes.INTEGER,
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
        'user_role_relations',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'userRole';
  }

  getRelationIdName(): string {
    return '';
  }
}
