import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { BotTeleController } from './controller';
import { BotTeleService } from './service';

@Module({
  imports: [RDSModule],
  controllers: [BotTeleController],
  providers: [BotTeleService],
  exports: [BotTeleService],
})
export class BotTeleModule { }
