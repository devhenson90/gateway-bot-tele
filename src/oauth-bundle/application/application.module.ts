import { Module } from '@nestjs/common';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from './repositories/application.repository';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, ApplicationRepository],
  exports: [ApplicationService, ApplicationRepository],
})
export class ApplicationModule { }
