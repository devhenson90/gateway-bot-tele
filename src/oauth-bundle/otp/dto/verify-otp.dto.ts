import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsNumber, IsBoolean, IsObject, IsArray, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class VerifyOTPDTO extends BaseDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(6)
  @ApiProperty({
    description: 'OTP',
    type: String,
    example: '111111',
    required: true
  })
  otpNumber: string;

  @IsString()
  @ApiProperty({
    description: 'reference OTP',
    type: String,
    example: 'tro2D',
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

export class VerifyOTPResultDTO extends BaseDTO {
  @IsString()
  @ApiProperty({
    description: 'OTP Is Valid',
    type: Boolean,
    example: true,
    required: true
  })
  isValid: boolean;
}