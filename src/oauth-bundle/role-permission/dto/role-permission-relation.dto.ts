import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class RolePermissionRelationDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'role id',
    type: Number,
    example: 1,
  })
  roleId: number;

  @IsNumber()
  @ApiProperty({
    description: 'permission id',
    type: Number,
    example: 1,
  })
  permissionId: number;
}
