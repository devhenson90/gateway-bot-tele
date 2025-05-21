import { Injectable } from '@nestjs/common';
import { DataTypes, Model, ModelStatic } from 'sequelize';
import { RDSService } from 'artifacts/rds/rds.service';
import { BaseRepository } from 'artifacts/rds/core/base.repository';

@Injectable()
export class ApplicationScopeRelationRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'applicationScopeRelation',
        {
          applicationId: {
            type: DataTypes.INTEGER,
          },
          scopeMasterId: {
            type: DataTypes.INTEGER,
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
        'application_scope_relations',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'applicationScopeRelation';
  }

  getRelationIdName(): string {
    return '';
  }
}
