import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { RoleRepository } from './repositories/role.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [RDSModule],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository],
  exports: [RoleRepository],
})
export class RoleModule { }
