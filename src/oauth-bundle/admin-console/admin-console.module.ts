import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { UserModule } from '../user/user.module';
import { AdminConsoleController } from './admin-console.controller';
import { AdminConsoleService } from './admin-console.service';
import { AdminConsoleRepository } from './repositories/admin-console.repository';

@Module({
  imports: [RDSModule, UserModule],
  controllers: [AdminConsoleController],
  providers: [AdminConsoleService, AdminConsoleRepository],
  exports: [AdminConsoleService],
})
export class AdminConsoleModule { }
