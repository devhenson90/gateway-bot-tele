import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class SmsConfigurationDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of sms configuration',
    type: Number,
    example: 1,
  })
  id: number;

  @IsString()
  @ApiProperty({
    description: 'name of sms configuration',
    type: String,
    example: 'application name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'service of sms configuration',
    type: String,
    example: 'application service',
  })
  service: string;

  @IsString()
  @ApiProperty({
    description: 'apiKey of sms configuration',
    type: String,
    example: 'application apiKey',
  })
  apiKey: string;

  @IsString()
  @ApiProperty({
    description: 'secretKey of sms configuration',
    type: String,
    example: 'application secretKey',
  })
  secretKey: string;

  @IsString()
  @ApiProperty({
    description: 'sender of sms configuration',
    type: String,
    example: 'application sender',
  })
  sender: string;

  @IsDate()
  @ApiProperty({
    description: 'Created date of sms configuration',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of sms configuration',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
