import { Module } from '@nestjs/common';
import { DayJsService } from './day-js.service';

@Module({
  imports: [],
  controllers: [],
  providers: [DayJsService],
  exports: [DayJsService]
})
export class DayJsModule {}
