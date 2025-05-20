import { Module } from '@nestjs/common';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ScopeMasterRepository } from './repositories/scope-master.repository';
import { ScopeMasterController } from './scope-master.controller';
import { ScopeMasterService } from './scope-master.service';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [ScopeMasterController],
  providers: [ScopeMasterService, ScopeMasterRepository],
  exports: [ScopeMasterService, ScopeMasterRepository],
})
export class ScopeMasterModule { }
