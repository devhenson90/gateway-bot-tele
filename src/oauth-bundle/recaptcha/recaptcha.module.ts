import { Module } from '@nestjs/common';
import { RDSModule } from 'artifacts/rds/rds.module';
import { RecaptchaController } from './recaptcha.controller';
import { RecaptchaService } from './recaptcha.service';

@Module({
  imports: [RDSModule],
  controllers: [RecaptchaController],
  providers: [
    RecaptchaService
  ],
  exports: [RecaptchaService],
})
export class RecaptchaModule { }
