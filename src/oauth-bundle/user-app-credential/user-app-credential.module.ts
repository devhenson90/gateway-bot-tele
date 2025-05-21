import { Module } from '@nestjs/common';
import { AESCryptoService } from 'artifacts/crypto/aes-crypto.service';
import { RDSModule } from 'artifacts/rds/rds.module';
import { UserScopeRelationRepository } from 'src/oauth-bundle/user-scope/repositories/user-scope-relation.repository';
import { UserBLL } from 'src/oauth-bundle/user/bll/user.bll';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { UserAppCredentialRepository } from './repositories/user-app-credential.repository';
import { UserAppCredentialController } from './user-app-credential.controller';
import { UserAppCredentialService } from './user-app-credential.service';


@Module({
  imports: [RDSModule],
  controllers: [UserAppCredentialController],
  providers: [
    UserBLL,
    UserAppCredentialService,
    UserAppCredentialRepository,
    RoleRepository,
    PermissionRepository,
    UserScopeRelationRepository,
    AESCryptoService
  ],
  exports: [UserAppCredentialService, UserAppCredentialRepository, AESCryptoService],
})
export class UserAppCredentialModule { }
