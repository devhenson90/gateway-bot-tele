import { forwardRef, Module } from '@nestjs/common';
import { CryptoModule } from 'artifacts/crypto/crypto.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ApplicationRepository } from '../application/repositories/application.repository';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { UserAppCredentialRepository } from '../user-app-credential/repositories/user-app-credential.repository';
import { UserForgotCodeModule } from '../user-forgot-code/user-forgot-code.module';
import { UserBLL } from './bll/user.bll';
import { UserAssociationRepository } from './repositories/user-association.repository';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [RDSModule, UserForgotCodeModule, CryptoModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserAssociationRepository,
    UserRepository,
    RoleRepository,
    PermissionRepository,
    UserBLL,
    UserAppCredentialRepository,
    ApplicationRepository,
  ],
  exports: [UserService, UserRepository, UserBLL, UserAssociationRepository],
})
export class UserModule { }
