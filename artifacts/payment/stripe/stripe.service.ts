import { Injectable } from '@nestjs/common';
import { PaymentStripeBLL } from './stripe.bll';

@Injectable()
export class StripeService {
  constructor(
    public readonly paymentStripeBLL: PaymentStripeBLL
  ) { }
}
