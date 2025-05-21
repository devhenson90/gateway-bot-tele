import { Module } from '@nestjs/common';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationRepository } from '../application/repositories/application.repository';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { ScopeMasterRepository } from '../scope-master/repositories/scope-master.repository';
import { TMPAuthCodeRepository } from '../tmp-auth-code/repositories/tmp-auth-code.repository';
import { UserAppCredentialRepository } from '../user-app-credential/repositories/user-app-credential.repository';
import { UserAssociationRepository } from '../user/repositories/user-association.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { UserScopeBLL } from './bll/user-scope.bll';
import { UserScopeRelationRepository } from './repositories/user-scope-relation.repository';
import { UserScopeAssociationRepository } from './repositories/user-scope.repository';
import { UserScopeController } from './user-scope.controller';
import { UserScopeService } from './user-scope.service';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [UserScopeController],
  providers: [
    UserScopeBLL,
    UserScopeService,
    UserScopeAssociationRepository,
    UserScopeRelationRepository,
    UserAssociationRepository,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    ScopeMasterRepository,
    TMPAuthCodeRepository,
    UserAppCredentialRepository,
    ApplicationRepository,
  ],
  exports: [UserScopeService, UserScopeRelationRepository]
})
export class UserScopeModule { }
