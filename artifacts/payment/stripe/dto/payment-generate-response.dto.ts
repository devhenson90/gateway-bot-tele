import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';

export class StripeGeneratePaymentResponseDTO {
  @IsString()
  @ApiProperty({
    description:
      'Id transaction payment',
    type: String,
    example: "pi_3QkGD2HIiZYCnQr31IVCaU41",
  })
  paymentIntentId: string;

  @IsString()
  @ApiProperty({
    description:
      'Status of Payment',
    type: String,
    example: 'requires_action',
  })
  status: string;

  @IsString()
  @ApiProperty({
    description:
      'URL qr code generated',
    type: String,
    example: 'qr code url',
  })
  qrCodeUrl: string;

}
