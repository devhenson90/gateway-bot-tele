import { Logger } from '@nestjs/common';
import { PostgresQueryGeneratorPlugin } from './postgres/query-generator';
import { PostgresFixLocalTimezonePlugin } from './postgres/fix-local-timezone';

export class RDSPlugin {
  static apply() {
    PostgresQueryGeneratorPlugin();
    Logger.log('PostgresQueryGeneratorPlugin initialized', 'RDSPlugin');
    PostgresFixLocalTimezonePlugin();
    Logger.log('PostgresFixLocalTimezonePlugin initialized', 'RDSPlugin');
  }
}
