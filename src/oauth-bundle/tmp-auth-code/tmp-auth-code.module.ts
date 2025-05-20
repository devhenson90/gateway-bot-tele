import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { TMPAuthCodeController } from './tmp-auth-code.controller';
import { TMPAuthCodeService } from './tmp-auth-code.service';
import { TMPAuthCodeRepository } from './repositories/tmp-auth-code.repository';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [TMPAuthCodeController],
  providers: [TMPAuthCodeService, TMPAuthCodeRepository],
})
export class TMPAuthCodeModule {}
