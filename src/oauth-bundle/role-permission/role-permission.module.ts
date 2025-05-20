import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { PermissionRepository } from '../permission/repositories/permission.repository';
import { RoleRepository } from '../role/repositories/role.repository';
import { RolePermissionBLL } from './bll/role-permission.bll';
import { RolePermissionRelationRepository } from './repositories/role-permission-relation.repository';
import { RolePermissionAssociationRepository } from './repositories/role-permission.repository';
import { RolePermissionController } from './role-permission.controller';
import { RolePermissionService } from './role-permission.service';

@Module({
  imports: [RDSModule],
  controllers: [RolePermissionController],
  providers: [
    RolePermissionBLL,
    RolePermissionService,
    RolePermissionAssociationRepository,
    RolePermissionRelationRepository,
    RoleRepository,
    PermissionRepository,
  ],
  exports: [RolePermissionService, RolePermissionAssociationRepository],
})
export class RolePermissionModule { }
