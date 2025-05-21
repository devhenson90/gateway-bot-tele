import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TransactionInquiryRequestDTO {

  @IsString()
  @ApiProperty({
    description: 'Reference Number 1',
    type: String,
    example: '',
  })
  reference1: string;

  @IsString()
  @ApiProperty({
    description: 'Biller ID from partner',
    type: String,
    example: '',
  })
  billerId: string;

  @IsString()
  @ApiProperty({
    description: 'Date of transaction.',
    type: String,
    example: '',
  })
  transactionDate: string;

  @IsString()
  @ApiProperty({
    description: 'Event code of payment type',
    type: String,
    example: '00300100',
  })
  eventCode: string;

}
