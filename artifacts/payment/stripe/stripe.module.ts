import { forwardRef, Module } from '@nestjs/common';
import { PaymentStripeBLL } from './stripe.bll';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [],
  controllers: [StripeController],
  providers: [StripeService, PaymentStripeBLL],
  exports: [StripeService, PaymentStripeBLL],
})
export class StripeModule { }
