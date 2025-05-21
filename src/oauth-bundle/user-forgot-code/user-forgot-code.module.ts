import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { UserForgotCodeService } from './user-forgot-code.service';
import { UserForgotCodeRepository } from './repositories/user-forgot-code.repository';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [],
  providers: [UserForgotCodeService, UserForgotCodeRepository],
  exports: [UserForgotCodeService, UserForgotCodeRepository]
})
export class UserForgotCodeModule {}
