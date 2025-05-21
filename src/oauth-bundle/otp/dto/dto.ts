

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class OtpDTO extends BaseDTO {
  @IsString()
  @ApiProperty({
    description: 'message format of otp',
    type: String,
    example: 'Prompt Care OTP: :OTP_NUMBER (Ref: :REF_CODE)',
  })
  message: string;

  @IsString()
  @ApiProperty({
    description: 'tel of otp',
    type: String,
    example: '',
  })
  phone: string;
}
