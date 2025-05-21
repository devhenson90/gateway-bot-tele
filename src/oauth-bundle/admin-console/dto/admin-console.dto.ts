import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate, IsEmail } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class AdminConsoleDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of adminConsole',
    type: Number,
    example: 1,
  })
  id: number;

  @IsEmail()
  @ApiProperty({
    type: String,
  })
  email: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  password: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  avatar: string;

  @IsString()
  @ApiProperty({
    type: String,
  })
  status: string;

  @IsDate()
  @ApiProperty({
    type: Date,
  })
  lastLoginAt: Date;

  @IsDate()
  @ApiProperty({
    type: Date,
  })
  lastActiveAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'created date of adminConsole',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'updated date of adminConsole',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
