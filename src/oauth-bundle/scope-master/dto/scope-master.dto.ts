import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class ScopeMasterDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of scope master',
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
    description: 'name of scope master',
    type: String,
    example: 'name',
  })
  name: string;

  @IsString()
  @ApiProperty({
    description: 'scope of scope master',
    type: String,
    example: 'scope',
  })
  scope: string;

  @IsString()
  @ApiProperty({
    description: 'host name of scope master',
    type: String,
    example: 'host name',
  })
  hostName: string;

  @IsString()
  @ApiProperty({
    description: 'url path of scope master',
    type: String,
    example: 'url path',
  })
  urlPath: string;

  @IsString()
  @ApiProperty({
    description: 'jwt token secret of scope master',
    type: String,
    example: 'jwt token',
  })
  jwtTokenSecret: string;

  @IsString()
  @ApiProperty({
    description: 'jwt refresh token secret of scope master',
    type: String,
    example: 'jwt refresh token',
  })
  jwtRefreshTokenSecret: string;

  @IsString()
  @ApiProperty({
    description: 'type of scope',
    type: String,
    example: 'auth',
  })
  type: string;

  @IsString()
  @ApiProperty({
    description: 'status of user',
    type: String,
    example: 'enable',
  })
  status: string;

  @IsDate()
  @ApiProperty({
    description: 'Created date of scope master',
    type: Date,
    example: '',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of scope master',
    type: Date,
    example: '',
  })
  updatedAt: Date;
}
