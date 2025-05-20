import { ApiProperty } from '@nestjs/swagger';
import { bool } from 'aws-sdk/clients/signer';
import { IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UserDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of user',
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
    description: 'username of user',
    type: String,
    example: 'root',
  })
  username: string;

  @IsString()
  @ApiProperty({
    description: 'email of user',
    type: String,
    example: 'test@mail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'phone of user',
    type: String,
    example: '66810000000',
  })
  phone: string;

  @IsString()
  @ApiProperty({
    description: 'password of user',
    type: String,
    example: 'XXXXX',
  })
  password: string;

  @IsString()
  @ApiProperty({
    description: 'pinCode of user',
    type: String,
    example: 'XXXXX',
  })
  pinCode: string;

  @IsString()
  @ApiProperty({
    description: 'access key id of user',
    type: String,
    example: 'accessKeyId',
  })
  accessKeyId: string;

  @IsString()
  @ApiProperty({
    description: 'secret access key of user',
    type: String,
    example: 'secretAccessKeyId',
  })
  secretAccessKeyId: string;

  @IsString()
  @ApiProperty({
    description: 'status of user',
    type: String,
    example: 'enable',
  })
  status: string;

  @IsDate()
  @ApiProperty({
    description: 'secret expiration of user',
    type: Date,
    example: '2023-12-31',
  })
  secretExpiredAt: Date;

  @IsNumber()
  @ApiProperty({
    description: 'role id of user',
    type: Number,
    example: 1,
  })
  roleId: number;

  @IsDate()
  @ApiProperty({
    description: 'Last login of user',
    type: Date,
    example: '',
  })
  lastLoginAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Last active of user',
    type: Date,
    example: '',
  })
  lastActiveAt: Date;

  @IsNumber()
  @ApiProperty({
    description: 'role id of user',
    type: Number,
    example: 1,
  })
  originAppId: number;

  @IsBoolean()
  @ApiProperty({
    description: 'Is first login of user',
    type: Boolean,
    example: false,
  })
  isFirstLogin: bool;

  @IsBoolean()
  @ApiProperty({
    description: 'Is mfa verification of user',
    type: Boolean,
    example: false,
  })
  isMfaVerification: bool;

  @IsBoolean()
  @ApiProperty({
    description: 'Is mfa enabled of user',
    type: Boolean,
    example: false,
  })
  isMfaEnabled: bool;

  @IsString()
  @ApiProperty({
    description: 'two factor secret of user',
    type: String,
    example: 'XXXXX',
  })
  twoFactorSecret: string;

  @IsDate()
  @ApiProperty({
    description: 'Last updated password of user',
    type: Date,
    example: '',
  })
  lastUpdatedPassword: Date;

  @IsDate()
  @ApiProperty({
    description: 'Created date of user',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of user',
    type: Date,
    example: '',
  })
  updatedAt: Date;

  apps?: any[];
}

export class UserChangeCredentialDTO extends UserDTO {
  @IsString()
  @ApiProperty({
    description: 'oldPassword',
    type: String,
    example: 'XXXXX',
  })
  oldPassword: string;

  @IsString()
  @ApiProperty({
    isArray: true,
    description: 'app credentials which use',
    type: Array<Number>,
    example: [1, 4],
  })
  appIds: number[];
}

export class UserChangePasswordDTO {
  @IsString()
  @ApiProperty({
    description: 'oldPassword',
    type: String,
    example: 'XXXXX',
  })
  oldPassword: string;

  @IsString()
  @ApiProperty({
    description: 'newPassword',
    type: String,
    example: 'XXXXX',
  })
  password: string;
}

export class SetPasswordDTO {
  @IsString()
  @ApiProperty({
    description: 'newPassword',
    type: String,
    example: 'XXXXX',
  })
  password: string;

  @IsString()
  @ApiProperty({
    description: 'confirmPassword',
    type: String,
    example: 'XXXXX',
  })
  confirmPassword: string;
}