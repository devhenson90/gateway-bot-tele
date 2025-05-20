import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StripeGeneratePaymentResponseDTO } from './dto/payment-generate-response.dto';
import { StripeGeneratePaymentDTO } from './dto/payment-generate.dto';

export class PaymentStripeConfig {
  endpointApi: string;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
}

@Injectable()
export class PaymentStripeBLL {
  private readonly apiHost: string;
  private readonly cfg: PaymentStripeConfig;
  private stripe: any;

  constructor(
    configService: ConfigService,
  ) {
    this.cfg = configService.get('STRIPE_CONFIG');
    this.apiHost = this.cfg.endpointApi + '/'
  }

  getConfig(): PaymentStripeConfig {
    return this.cfg;
  }

  async getBalance() {
    try {
      return await this.stripe.balance.retrieve();
    } catch (error) {
      throw new Error(`Failed to retrieve balance: ${error.message}`);
    }
  }

  async triggerCallback(signature, body: any) {
    const endpointSecret = this.cfg.webhookSecret;
    let event;

    try {
      // Verify the webhook signature
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Invalid webhook signature');
    }

    // Process the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const sessions = await this.stripe.checkout.sessions.list({
          payment_intent: event.data.object.id,
          limit: 1,
        });

        if (sessions.data.length > 0) {
          const session = sessions.data.filter((session: any) => session.status === 'complete' && session.object === 'checkout.session');
          const orderId = session[0].metadata?.orderId;
          const userId = session[0].metadata?.userId;

          if (orderId && userId) {
          }
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  async createPromptPayPaymentIntent(body: StripeGeneratePaymentDTO): Promise<StripeGeneratePaymentResponseDTO> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: body.amount,
        currency: body.currency,
        payment_method_types: ['promptpay']
      });
      console.log("paymentIntent", paymentIntent)
      const qrCodeUrl = paymentIntent.next_action?.promptpay_display_qr_code?.image_url || null;

      return {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        qrCodeUrl,
      };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }

  async createPaymentLink(body: StripeGeneratePaymentDTO) {
    try {
      // Step 1: Create a product
      const product = await this.stripe.products.create({
        name: body.description || 'Payment Link',
      });

      // Step 2: Create a price for the product
      const price = await this.stripe.prices.create({
        unit_amount: body.amount,
        currency: body.currency,
        product: product.id,
      });

      // Step 3: Generate the payment link
      const paymentLink = await this.stripe.paymentLinks.create({
        line_items: [
          {
            price: price.id,
            quantity: body.quantity,
          },
        ],
        ...(body.orderId ? {
          metadata: {
            orderId: body.orderId,
            userId: body.userId,
          },
        } : {}),
      });

      return {
        paymentLink: paymentLink.url,
        paymentLinkId: paymentLink.id,
        expiresAt: paymentLink.expires_at,
      };
    } catch (error) {
      console.error('Error creating payment link:', error.message);
      throw error;
    }
  }
}
