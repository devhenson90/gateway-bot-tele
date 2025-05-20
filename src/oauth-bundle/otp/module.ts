

import { Module } from '@nestjs/common';
import { TCPModule } from 'artifacts/microservices/tcp/tcp.module';
import { RDSModule } from 'artifacts/rds/rds.module';
import { OtpController } from './controller';
import { OtpService } from './service';
import { AuthenticatorBLL } from './bll/authenicator.bll';
import { OTPBLL } from './bll/otp.bll';
import { SMSBLL } from './bll/sms.bll';
import { SmsConfigurationRepository } from '../sms-configuration/repositories/repository';

@Module({
  imports: [RDSModule, TCPModule],
  controllers: [OtpController],
  providers: [OtpService, AuthenticatorBLL, OTPBLL, SMSBLL, SmsConfigurationRepository],
})
export class OtpModule {}
