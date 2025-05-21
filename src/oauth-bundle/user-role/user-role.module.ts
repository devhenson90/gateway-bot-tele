import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { RolePermissionRelationRepository } from '../role-permission/repositories/role-permission-relation.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { UserRepository } from '../user/repositories/user.repository';
import { UserRoleRelationRepository } from './repositories/user-role-relation.repository';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRoleController } from './user-role.controller';
import { UserRoleService } from './user-role.service';

@Module({
  imports: [RDSModule],
  controllers: [UserRoleController],
  providers: [
    UserRoleService,
    UserRepository,
    UserRoleRelationRepository,
    UserRoleRepository,
    RoleRepository,
    PermissionRepository,
    RolePermissionRelationRepository,
  ],
  exports: [UserRoleRelationRepository],
})
export class UserRoleModule { }
