import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UserAppCredentialDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of user',
    type: Number,
    example: 1,
  })
  id: number;

  @IsNumber()
  @ApiProperty({
    description: 'appId of user',
    type: Number,
    example: 1,
  })
  appId: number;

  @IsNumber()
  @ApiProperty({
    description: 'userId of user',
    type: Number,
    example: 1,
  })
  userId: number;

  @IsDate()
  @ApiProperty({
    description: 'Created date of user',
    type: Date,
    example: new Date(),
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Updated date of user',
    type: Date,
    example: new Date(),
  })
  updatedAt: Date;
}

export class UserAppCredentialUnassignmentDTO extends BaseDTO {

  @IsNumber()
  @ApiProperty({
    description: 'appId of user',
    type: Number,
    example: 1,
  })
  appId: number;

  @IsNumber()
  @ApiProperty({
    description: 'userId of user',
    type: Number,
    example: 1,
  })
  userId: number;
}
