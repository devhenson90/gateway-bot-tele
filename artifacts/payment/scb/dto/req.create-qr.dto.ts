import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateQrRequestDTO {

  @IsEmpty()
  @IsString()
  @ApiProperty({
    description: 'currency of shopee pay',
    type: String,
    example: 'THB',
  })
  qrType: string;

  @IsString()
  @ApiProperty({
    description: 'payment reference id of shopee pay',
    type: String,
    example: '',
  })
  ppType: string;

  @IsString()
  @ApiProperty({
    description: 'expiry time id of shopee pay',
    type: String,
    example: '',
  })
  ppId: String;

  @IsString()
  @ApiProperty({
    description: 'terminal id of shopee pay',
    type: String,
    example: '',
  })
  amount: string;
  
  @IsString()
  @ApiProperty({
    description: 'payment reference id of shopee pay',
    type: String,
    example: '',
  })
  ref1: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  ref2: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  ref3: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  merchantId: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  terminalId: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  invoice: string;

  @IsString()
  @ApiProperty({
    description: 'additional info of shopee pay',
    type: String,
    example: '',
  })
  csExtExpiryTime: string;

  @IsString()
  @ApiProperty({
    description: 'Number of times the qr can be paid',
    type: String,
    example: '1',
  })
  numberOfTimes: string;
  
  @IsString()
  @ApiProperty({
    description: 'Expired date and time of qr',
    type: String,
    example: 'YYYY-MM-DD HH:MM:SS',
  })
  expiryDate: string;

}
