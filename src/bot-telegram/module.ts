import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { BotTeleController } from './controller';
import { BotTeleService } from './service';
import { ThirdPartyService } from './bll/co2pay';
import { HTTPModule } from 'artifacts/microservices/http/http.module';

@Module({
  imports: [RDSModule, HTTPModule.forRoot()],
  controllers: [BotTeleController],
  providers: [BotTeleService, ThirdPartyService],
  exports: [BotTeleService],
})
export class BotTeleModule {}
