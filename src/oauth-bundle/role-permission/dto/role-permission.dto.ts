import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PermissionDTO } from 'src/oauth-bundle/permission/dto/permission.dto';
import { RoleDTO } from 'src/oauth-bundle/role/dto/role.dto';

export class RolePermissionDTO extends RoleDTO {
  @IsArray()
  @ApiProperty({
    description: 'permission in role',
    type: [],
    example: [],
  })
  permissions: PermissionDTO[];
}
