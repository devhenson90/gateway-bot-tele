import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { SmsConfigurationDTO } from 'src/oauth-bundle/sms-configuration/dto/dto';

export class SMSDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'phone number of patient',
    type: String,
    example: 1,
    required: true
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'message sms',
    type: String,
    example: 'OTP : 111111'
  })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Sender Name',
    type: String,
    example: 'THBTest'
  })
  sender: string;

  @IsBoolean()
  @ApiProperty({
    description: 'status sent sms',
    type: Boolean,
    example: false
  })
  statusSent?: boolean;

  @IsString()
  @ApiProperty({
    description: 'response message',
    type: String,
    example: 'OK',
    required: true
  })
  prettyMessage?: string;

  @IsString()
  @ApiProperty({
    description: 'response message',
    type: String,
    example: 'OK',
    required: true
  })
  referenceCode: string;


  smsConfiguration: SmsConfigurationDTO;
}


export class SMSResultDTO extends BaseDTO {
  @IsBoolean()
  @ApiProperty({
    description: 'status sent sms',
    type: Boolean,
    example: false
  })
  statusSent: boolean;

  @IsString()
  @ApiProperty({
    description: 'response message',
    type: String,
    example: 'OK',
    required: true
  })
  prettyMessage: string;

  @IsString()
  @ApiProperty({
    description: 'referenceCode',
    type: String,
    example: 'AAAAA',
    required: true
  })
  referenceCode: string;

  @IsDate()
  @ApiProperty({
    description: 'Expired OTP',
    type: Date,
    required: true
  })
  exipredAt: Date;
}
