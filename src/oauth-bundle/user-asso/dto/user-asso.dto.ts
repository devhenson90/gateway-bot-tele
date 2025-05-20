import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsObject, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { RoleTypeEnum } from 'src/oauth-bundle/role/enum/user-role.enum';

export class UserAssoDTO extends BaseDTO {
  @IsObject()
  @ApiProperty({
    description: 'Application Object',
    type: Object,
    example: { name: 'name', email: 'email' },
  })
  user: UserDTO;

  @IsArray()
  @ApiProperty({
    description: 'Applications ids',
    type: Array,
    example: [1, 2, 3],
  })
  applications: number[];

  @IsArray()
  @ApiProperty({
    description: 'Scopes ids',
    type: Array,
    example: [1, 2, 3],
  })
  scopes: number[];

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

class UserDTO extends BaseDTO {
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

  @IsNumber()
  @ApiProperty({
    description: 'role id of user',
    type: Number,
    example: 1,
  })
  originAppId: number;

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
    description: 'status of user',
    type: String,
    example: 'enable',
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