import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';
import { RoleTypeEnum } from '../enum/user-role.enum';

export class RoleDTO extends BaseDTO {
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

  @IsDate()
  @ApiProperty({
    description: 'created date of role',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'updated date of role',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
