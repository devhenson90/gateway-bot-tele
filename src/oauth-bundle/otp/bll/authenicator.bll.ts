import { ConfigService } from '@nestjs/config';
import { authenticator } from 'otplib';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthenticatorBLL {
  private configOTP;
  constructor(private configService: ConfigService) {
    this.configOTP = this.getOTPConfig();
  }

  authenticator() {
    return authenticator.clone({
      epoch: dayjs().startOf('second').unix() * 1000,
      step: parseInt(this.configOTP.step),
      window: parseInt(this.configOTP.window),
    });
  }

  getExpiredDate() {
    return dayjs().add(this.configOTP.window, 'seconds').toDate();
  }

  getOTPConfig() {
    return this.configService.get('OTP');
  }

}
