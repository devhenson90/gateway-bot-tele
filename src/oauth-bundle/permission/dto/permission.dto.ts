import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class PermissionDTO extends BaseDTO {
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

  @IsDate()
  @ApiProperty({
    description: 'created date of permission',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'updated date of permission',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
