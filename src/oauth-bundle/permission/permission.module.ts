import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  imports: [RDSModule],
  controllers: [PermissionController],
  providers: [PermissionService, PermissionRepository],
  exports: [PermissionRepository],
})
export class PermissionModule { }
