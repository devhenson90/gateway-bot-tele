import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class VerifyReCaptchaDTO {
  @IsString()
  @ApiProperty({
    description: 'response reCaptcha',
    type: String,
    example: '***'
  })
  response: string;

  @IsBoolean()
  @ApiProperty({
    description: 'status success reCaptcha',
    type: String,
    example: false
  })
  success: boolean;
}
