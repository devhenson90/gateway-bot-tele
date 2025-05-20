import { Module } from '@nestjs/common';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationRepository } from '../application/repositories/application.repository';
import { ScopeMasterRepository } from '../scope-master/repositories/scope-master.repository';
import { TMPAuthCodeRepository } from '../tmp-auth-code/repositories/tmp-auth-code.repository';
import { ApplicationScopeController } from './application-scope.controller';
import { ApplicationScopeService } from './application-scope.service';
import { ApplicationScopeBLL } from './bll/application-scope.bll';
import { ApplicationScopeRelationRepository } from './repositories/application-scope-relation.repository';
import { ApplicationScopeAssociationRepository } from './repositories/application-scope.repository';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [ApplicationScopeController],
  providers: [
    ApplicationScopeBLL,
    ApplicationScopeService,
    ApplicationScopeAssociationRepository,
    ApplicationScopeRelationRepository,
    ApplicationRepository,
    ScopeMasterRepository,
    TMPAuthCodeRepository,
  ],
  exports: [ApplicationScopeService, ApplicationScopeRelationRepository],
})
export class ApplicationScopeModule { }
