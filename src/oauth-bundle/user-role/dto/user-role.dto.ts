import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UserRoleDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of userRole',
    type: Number,
    example: 1,
  })
  id: number;

  @IsNumber()
  @ApiProperty({
    description: 'userId of userRole',
    type: Number,
    example: 1,
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: 'roleId of userRole',
    type: Number,
    example: 1,
  })
  roleId: number;

  @IsDate()
  @ApiProperty({
    description: 'created date of userRole',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'updated date of userRole',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
