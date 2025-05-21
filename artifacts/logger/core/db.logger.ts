import { Logger } from '@nestjs/common';

const DB_CONTEXT = 'DatabaseSQL';

export function DBLogging(message: any) {
  try {
    if (typeof message === 'string') {
      Logger.log(
        message.replace(/Executing \(.+\): /g, '').replace(/\s+/g, ' '),
        DB_CONTEXT,
      );
    }
  } catch (error) {
    // continue
  }
}
