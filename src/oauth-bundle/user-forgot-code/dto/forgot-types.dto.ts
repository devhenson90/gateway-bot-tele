import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDate } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class ForgotTypeDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'id of role',
    type: Number,
  })
  id: number;

  @IsString()
  @ApiProperty({
    description: 'forgotType',
    type: String,
  })
  forgotType: string;

  @IsString()
  @ApiProperty({
    description: 'forgotMethod',
    type: String,
  })
  forgotMethod: string;

  @IsString()
  @ApiProperty({
    description: 'code',
    type: String,
  })
  code: string;

  @IsNumber()
  @ApiProperty({
    description: 'userId',
    type: Number,
  })
  userId: number;

  @IsDate()
  @ApiProperty({
    description: 'expiredAt',
    type: Date,
    example: '',
  })
  expiredAt: Date;

  @IsString()
  @ApiProperty({
    description: 'expiredReason',
    type: String,
  })
  expiredReason: string;

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
