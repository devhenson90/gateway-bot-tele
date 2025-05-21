import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { RoleTypeEnum } from 'src/oauth-bundle/role/enum/user-role.enum';

export class ApplicationAssoDTO extends BaseDTO {
  @IsObject()
  @ApiProperty({
    description: 'Application Object',
    type: Object,
    example: { name: 'name', description: 'description' },
  })
  application: ApplicationDTO;

  @IsArray()
  @ApiProperty({
    description: 'Scopes ids',
    type: Array,
    example: [1, 2, 3],
  })
  scopes: number[];

  @IsObject()
  @ApiProperty({
    description: 'SMS Configuration Object',
    type: Object,
    example: { name: 'name', service: 'service', apiKey: 'apiKey' },
  })
  smsConfig: SmsConfigurationDTO;

  @IsArray()
  @ApiProperty({
    description: 'Roles Object',
    type: Array,
    example: [{
      id: 1,
      name: 'root',
      status: 'active',
    }],
  })
  roles: RoleDTO[];

  @IsArray()
  @ApiProperty({
    description: 'Roles Object',
    type: Array,
    example: [{
      id: 1,
      name: 'root',
      status: 'active',
    }],
  })
  rolesAdd: RoleDTO[];
}

class ApplicationDTO extends BaseDTO {
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
}

class RoleDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of role',
    type: Number,
    example: 1,
  })
  id: number;

  @IsNumber()
  @ApiProperty({
    description: 'applicationId of role',
    type: Number,
    example: 1,
  })
  applicationId: number;

  @IsString()
  @ApiProperty({
    description: 'name of role',
    type: String,
    example: 'root',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'status of role',
    type: String,
    example: 'active',
  })
  status: string;

  @IsString()
  @ApiProperty({
    description: 'type of userRole',
    type: String,
    enum: RoleTypeEnum,
  })
  type: string;

  @IsArray()
  @ApiProperty({
    description: 'Permissions Object',
    type: Array,
    example: [{
      id: 1,
      name: 'dashboard allow',
      permission: 'allow_dashboard',
      status: 'active',
    }],
  })
  permissions: PermissionDTO[];
}

class PermissionDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of permission',
    type: Number,
    example: 1,
  })
  id: number;

  @IsString()
  @ApiProperty({
    description: 'name of permission',
    type: String,
    example: 'dashboard allow',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'permission',
    type: String,
    example: 'allow_dashboard',
  })
  permission: string;

  @IsString()
  @ApiProperty({
    description: 'status of permission',
    type: String,
    example: 'active',
  })
  status: string;
}

class SmsConfigurationDTO extends BaseDTO {
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
}