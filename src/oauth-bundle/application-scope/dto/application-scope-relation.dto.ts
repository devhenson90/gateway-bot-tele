import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { BaseDTO } from 'src/common/dto/base.dto';

export class ApplicationScopeRelationDTO extends BaseDTO {
  @IsNumber()
  @ApiProperty({
    description: 'application id',
    type: Number,
    example: 1,
  })
  applicationId: number;

  @IsNumber()
  @ApiProperty({
    description: 'scope master id',
    type: Number,
    example: 1,
  })
  scopeMasterId: number;
}
