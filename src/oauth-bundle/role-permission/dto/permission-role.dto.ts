import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';
import { PermissionDTO } from 'src/oauth-bundle/permission/dto/permission.dto';
import { RoleDTO } from 'src/oauth-bundle/role/dto/role.dto';

export class PermissionRoleDTO extends PermissionDTO {
  @IsArray()
  @ApiProperty({
    description: 'role in permission',
    type: [],
    example: [],
  })
  roles: RoleDTO[];
}
