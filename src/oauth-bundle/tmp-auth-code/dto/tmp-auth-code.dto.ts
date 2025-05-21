import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsDate, IsString, IsObject } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export enum TEMP_AUTH_CODE_STATUS {
  INCOMPLETE = 'incomplete',
  ENCRYPTED = 'encrypted',
  COMPLETE = 'complete',
}

export class TMPAuthCodeDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of tmp auth code',
    type: Number,
    example: 1,
  })
  id: number;

  @IsNumber()
  @ApiProperty({
    description: 'userId of tmp auth code',
    type: Number,
    example: 1,
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: 'appId of tmp auth code',
    type: Number,
    example: 1,
  })
  appId: number;

  @IsString()
  @ApiProperty({
    description: 'code of tmp auth code',
    type: String,
    example: '123dwqepoo',
  })
  code: string;

  @IsString()
  @ApiProperty({
    description: 'csrf',
    type: String,
  })
  csrf: string;

  @IsString()
  @ApiProperty({
    description: 'auth code status of tmp auth code',
    type: String,
    example: 'complete',
  })
  status: string;

  @IsString()
  @ApiProperty({
    description: 'encrypted auth data of tmp auth code',
    type: String,
    example: 'dsapd232190dasd',
  })
  encryptedAuthData: string;

  @IsObject()
  @ApiProperty({
    description: 'auth token of tmp auth code',
    type: Object,
    example: { accessToken: 'zxc', refreshToken: 'abc' },
  })
  authToken: any;

  @IsString()
  @ApiProperty({
    description: 'grantType',
    type: String,
  })
  grantType: string;

  @IsDate()
  @ApiProperty({
    description: 'Expired date of tmp auth code',
    type: Date,
    example: '',
  })
  expiredAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Created date of tmp auth code',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of tmp auth code',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
