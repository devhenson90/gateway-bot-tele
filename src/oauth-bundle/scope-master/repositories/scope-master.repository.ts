import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RDSService } from 'artifacts/rds/rds.service';
import { DataTypes } from 'sequelize';

@Injectable()
export class ScopeMasterRepository extends BaseRepository {
  constructor(private readonly rdsService: RDSService) {
    super();
  }

  protected init() {
    this.model = this.rdsService
      .getRDSClient()
      .getModelBuilder()
      .define(
        'scopeMaster',
        {
          adminConsoleId: {
            type: DataTypes.INTEGER,
          },
          name: {
            type: DataTypes.STRING,
          },
          scope: {
            type: DataTypes.STRING,
          },
          hostName: {
            type: DataTypes.STRING,
          },
          urlPath: {
            type: DataTypes.STRING,
          },
          type: {
            type: DataTypes.STRING,
          },
          status: {
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
        'scope_masters',
        true,
      );
    return this.model;
  }

  getIdentifierName(): string {
    return 'scopeMaster';
  }

  getRelationIdName(): string {
    return '';
  }
}
