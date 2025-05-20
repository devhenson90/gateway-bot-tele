import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationModule } from '../application/application.module';
import { PermissionModule } from '../permission/permission.module';
import { RolePermissionModule } from '../role-permission/role-permission.module';
import { RoleModule } from '../role/role.module';
import { ScopeMasterModule } from '../scope-master/scope-master.module';
import { UserAppCredentialModule } from '../user-app-credential/user-app-credential.module';
import { UserRoleModule } from '../user-role/user-role.module';
import { UserScopeModule } from '../user-scope/user-scope.module';
import { UserModule } from '../user/user.module';
import { UserAssoBLL } from './bll/bll';
import { UserAssoRepository } from './repositories/user-asso.repository';
import { UserAssoController } from './user-asso.controller';
import { UserAssoService } from './user-asso.service';

@Module({
  imports: [
    RDSModule,
    UserModule,
    ApplicationModule,
    ScopeMasterModule,
    RoleModule,
    PermissionModule,
    UserScopeModule,
    UserAppCredentialModule,
    RolePermissionModule,
    UserRoleModule
  ],
  controllers: [UserAssoController],
  providers: [
    UserAssoService,
    UserAssoRepository,
    UserAssoBLL
  ],
  exports: [UserAssoService]
})
export class UserAssoModule { }
