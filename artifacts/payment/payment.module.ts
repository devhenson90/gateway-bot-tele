import { Module } from '@nestjs/common';
import { ScbModule } from './scb/scb.module';

@Module({
  imports: [ScbModule],
  exports: [ScbModule],
})
export class PaymentModule {}
