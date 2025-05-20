

import {
  Body,
  Controller,
  Post,
  Req
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OAuthAppReq, Public } from 'artifacts/auth/metadata/public.metadata';
import { RequestDTO } from 'src/common/dto/request.dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { OtpDTO } from './dto/dto';
import { SMSResultDTO } from './dto/sms.dto';
import { VerifyOTPDTO, VerifyOTPResultDTO } from './dto/verify-otp.dto';
import { OtpService } from './service';


@ApiTags('OTP')
@Controller('/v1/otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @ApiOperation({})
  @Public()
  @OAuthAppReq()
  @Post('')
  createOtp(@Req() req, @Body() otpDTO: RequestDTO<OtpDTO>): Promise<ResponseDTO<Partial<SMSResultDTO>>> {
    return this.otpService.sendSMS(
      req.oauthApp,
      otpDTO.data.message,
      otpDTO.data.phone,
    ).then((result) => {
      const response = new ResponseDTO<Partial<SMSResultDTO>>();
      response.data = result;
      return response;
    });
  }

  @ApiOperation({})
  @Public()
  @Post('/verification')
  createVerification(@Body() otpDTO: RequestDTO<VerifyOTPDTO>): Promise<ResponseDTO<VerifyOTPResultDTO>> {
    return this.otpService.verify(otpDTO.data).then((result) => {
      const response = new ResponseDTO<VerifyOTPResultDTO>();
      response.data = result;
      return response;
    });
  }
}
