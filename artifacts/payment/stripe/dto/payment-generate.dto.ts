import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString
} from 'class-validator';

export class StripeGeneratePaymentDTO {
  @IsNumber()
  @ApiProperty({
    description:
      'Please specific the decimal for each required result. such as 1000 is equal 10.00',
    type: Number,
    example: 1000,
  })
  amount: number;

  @IsNumber()
  @ApiProperty({
    description:
      'quantity of product whice purchase',
    type: Number,
    example: 1,
  })
  quantity: number;

  @IsString()
  @ApiProperty({
    description:
      'Currency what you want payment',
    type: String,
    example: 'THB',
  })
  currency: string;

  @IsString()
  @ApiProperty({
    description:
      'Description payment',
    type: String,
    example: '#1 Food',
  })
  description: string;

  @IsString()
  @ApiProperty({
    description: '',
    type: String,
    example: "000001",
  })
  orderId: string;

  @IsNumber()
  @ApiProperty({
    description: '',
    type: Number,
    example: 1,
  })
  userId: number;
}
