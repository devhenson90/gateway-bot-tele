import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as buddhistEra from 'dayjs/plugin/buddhistEra';
import * as relativeTime from 'dayjs/plugin/relativeTime';
import * as isBetween from 'dayjs/plugin/isBetween';
import * as isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import * as isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import 'dayjs/locale/th';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(buddhistEra);
dayjs.extend(relativeTime);
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// /* Set read time for postgres sql local for utc time */
// import * as pg from 'pg';
// const { types } = pg
// types.setTypeParser(types.builtins.DATE, str => dayjs.utc(str).toDate())
// types.setTypeParser(types.builtins.TIMESTAMP, str => dayjs.utc(str).toDate())

@Injectable()
export class DayJsService {
  public getUTCOffsetMinutes(isoDate): number {
    // The pattern will be ±[hh]:[mm], ±[hh][mm], or ±[hh], or 'Z'
    const offsetPattern = /([+-]\d{2}|Z):?(\d{2})?\s*$/;
    if (!offsetPattern.test(isoDate)) {
      throw new Error('Cannot parse UTC offset.');
    }
    const result = offsetPattern.exec(isoDate);
    return (+result[1] || 0) * 60 + (+result[2] || 0);
  }

  public getUtcOffset(dateOffset: any): number {
    let utcOffset = parseInt(dateOffset);
    if (isNaN(utcOffset)) {
      utcOffset = this.defaultUtcOffset;
    }
    return utcOffset;
  }

  public get defaultUtcOffset(): number {
    return 420;
  }

  public get dayjs() {
    return dayjs;
  }

  public parseTz(def: string | number | Date | dayjs.Dayjs | null | undefined, offset: number) {
    return dayjs(def).utcOffset(offset);
  }

  public now(offset?: number) {
    if (typeof offset === 'number') {
      return dayjs().utcOffset(offset);
    }
    return dayjs();
  }

  public nowTz(timezone?: string) {
    return dayjs().tz(timezone ?? 'Asia/Bangkok');
  }

}
