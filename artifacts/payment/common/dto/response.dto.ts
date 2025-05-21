import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { TextEnum } from '../enum/text.enum';

export class ResponseDTO {
  @IsString()
  @ApiProperty({
    description: 'message of actions',
    type: String,
    example: 'any message such as success',
  })
  message = TextEnum.Success;
}
