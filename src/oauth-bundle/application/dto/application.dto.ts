import { ApiProperty } from '@nestjs/swagger';
import { bool } from 'aws-sdk/clients/signer';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class ApplicationDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of application',
    type: Number,
    example: 1,
  })
  id: number;

  @IsNumber()
  @ApiProperty({
    type: Number,
  })
  adminConsoleId: number;

  @IsString()
  @ApiProperty({
    description: 'name of application',
    type: String,
    example: 'application name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'description of application',
    type: String,
    example: 'application description',
  })
  description: string;

  @IsString()
  @ApiProperty({
    description: 'clientid of application',
    type: String,
    example: 'application clientid',
  })
  clientId: string;

  @IsString()
  @ApiProperty({
    description: 'clientsecret of application',
    type: String,
    example: 'application client secret',
  })
  clientSecret: string;

  @IsString()
  @ApiProperty({
    description: 'redirect uri of application',
    type: String,
    example: 'application redirect uri',
  })
  redirectUri: string;

  @IsString()
  @ApiProperty({
    description: 'callback uri of application',
    type: String,
    example: 'application callback uri',
  })
  callbackUri: string;

  @IsString()
  @ApiProperty({
    description: 'status of application',
    type: String,
    example: 'application status',
  })
  status: string;

  @IsNumber()
  @ApiProperty({
    description: 'smsConfigurationId of application',
    type: Number,
    example: 1,
  })
  smsConfigurationId: number;

  @IsNumber()
  @ApiProperty({
    description: 'userid of application',
    type: Number,
    example: 1,
  })
  userId: number;

  @IsBoolean()
  @ApiProperty({
    description: 'verifyAccountName of application',
    type: Boolean,
    example: false,
  })
  verifyAccountName: bool;

  @IsDate()
  @ApiProperty({
    description: 'Created date of application',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of application',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
