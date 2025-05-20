import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Req
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'artifacts/auth/metadata/public.metadata';
import { StripeGeneratePaymentDTO } from './dto/payment-generate.dto';
import { StripeService } from './stripe.service';

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) { }

  @Get('/balance')
  getBalance(): Promise<StripeGeneratePaymentDTO> {
    return this.stripeService.paymentStripeBLL.getBalance()
      .then((data) => {
        return data;
      })
      .catch((err) => {
        Logger.error(err, err.stack, StripeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Post('/qr-payment')
  generateQRPayment(
    @Body('body') body: StripeGeneratePaymentDTO,
  ): Promise<any> {
    return this.stripeService.paymentStripeBLL.createPromptPayPaymentIntent(body)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        Logger.error(err, err.stack, StripeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Post('/payment-link')
  generatePaymentLink(
    @Body('body') body: StripeGeneratePaymentDTO,
  ): Promise<any> {
    return this.stripeService.paymentStripeBLL.createPaymentLink(body)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        Logger.error(err, err.stack, StripeService.name);
        throw new BadRequestException(err.message);
      });
  }

  @Public()
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: Request
  ): Promise<any> {
    return this.stripeService.paymentStripeBLL.triggerCallback(signature, req.body)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        Logger.error(err, err.stack, StripeService.name);
        throw new BadRequestException(err.message);
      });
  }
}
