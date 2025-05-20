import { Injectable } from '@nestjs/common';
import { BaseSqlRepository } from 'artifacts/rds/core/base.sql.repository';
import { RDSService } from 'artifacts/rds/rds.service';

@Injectable()
export class RDSHelperService extends BaseSqlRepository {
  constructor(
    rdsService: RDSService,
  ) {
    super(rdsService);
  }
}
