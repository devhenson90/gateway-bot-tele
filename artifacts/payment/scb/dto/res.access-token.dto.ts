import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsObject, IsString } from "class-validator";

export class SCBTokenResponseDTO {

  @IsObject()
  @ApiProperty({
    type: Object,
  })
  data: SCBTokenResponseDataDTO;

  @IsObject()
  @ApiProperty({
    type: Object,
  })
  status: SCBTokenResponseStatusDTO;
}

class SCBTokenResponseStatusDTO {

  @IsNumber()
  @ApiProperty()
  code: number;

  @IsString()
  @ApiProperty()
  description: string;

}

export class SCBTokenResponseDataDTO {

  @IsString()
  @ApiProperty()
  accessToken: string;

  @IsString()
  @ApiProperty()
  tokenType: string;

  @IsNumber()
  @ApiProperty()
  expiresIn: number;

  @IsNumber()
  @ApiProperty()
  expiresAt: number;
}