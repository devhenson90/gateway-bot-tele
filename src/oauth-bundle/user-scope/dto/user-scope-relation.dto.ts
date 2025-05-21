import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class UserScopeRelationDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'user id',
    type: Number,
    example: 1,
  })
  userId: number;

  @IsNumber()
  @ApiProperty({
    description: 'scope master id',
    type: Number,
    example: 1,
  })
  scopeMasterId: number;
}
