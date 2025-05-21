import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationScopeModule } from '../application-scope/application-scope.module';
import { ApplicationModule } from '../application/application.module';
import { PermissionModule } from '../permission/permission.module';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { RoleModule } from '../role/role.module';
import { ScopeMasterModule } from '../scope-master/scope-master.module';
import { SmsConfigurationRepository } from '../sms-configuration/repositories/repository';
import { UserModule } from '../user/user.module';
import { ApplicationAssoController } from './application-asso.controller';
import { ApplicationAssoService } from './application-asso.service';
import { ApplicationAssoBLL } from './bll/bll';
import { ApplicationAssoRepository } from './repositories/application-asso.repository';

@Module({
  imports: [
    RDSModule,
    ApplicationModule,
    ScopeMasterModule,
    ApplicationScopeModule,
    RoleModule,
    PermissionModule,
    UserModule,
    RolePermissionModule
  ],
  controllers: [ApplicationAssoController],
  providers: [
    ApplicationAssoService,
    ApplicationAssoRepository,
    SmsConfigurationRepository,
    ApplicationAssoBLL
  ],
})
export class ApplicationAssoModule { }
