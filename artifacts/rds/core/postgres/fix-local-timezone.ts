import { Logger } from '@nestjs/common';
import * as pg from 'pg';
import * as moment from 'moment';

const isAWS: boolean = process.env?.AWS_EXECUTION_ENV !== undefined;
const isProd: boolean = process.env?.NODE_ENV === 'production';
const isLocalhost: boolean = !isAWS && !isProd;

export function PostgresFixLocalTimezonePlugin() {
  if (isLocalhost) {
    const { types } = pg;
    types.setTypeParser(types.builtins.TIMESTAMP, (str) =>
      moment.utc(str).toDate(),
    );
    Logger.log(
      'TIMESTAMP without timezone on Sequelize node-postgres (on local) has been fixed',
      PostgresFixLocalTimezonePlugin.name,
    );
  } else {
    Logger.log(
      'This service is running on Cloud Server',
      PostgresFixLocalTimezonePlugin.name,
    );
  }
}
