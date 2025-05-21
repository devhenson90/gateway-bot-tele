import { ApiProperty } from '@nestjs/swagger';
import { IsEmpty, IsString } from 'class-validator';

export class SlipVerificationRequestDTO {

  @IsString()
  @ApiProperty({
    description: 'Use 014 for SCB',
    type: String,
    example: '014',
  })
  sendingBank: string;

}
