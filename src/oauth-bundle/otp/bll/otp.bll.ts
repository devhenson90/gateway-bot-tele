import { Injectable } from '@nestjs/common';
import { VerifyOTPDTO } from '../dto/verify-otp.dto';
import { AuthenticatorBLL } from './authenicator.bll';

@Injectable()
export class OTPBLL {
  constructor(
    private readonly authenticatorService: AuthenticatorBLL
  ) { }

  async generateOTP(): Promise<Partial<VerifyOTPDTO>> {
    const referenceCode = await this.generateReferenceCode(5)
    const secretToken = referenceCode;
    const otpNumber = this.authenticatorService.authenticator().generate(secretToken);
    const exipred = this.authenticatorService.getExpiredDate();
    return new Promise((resolve, reject) => {
      resolve({
        otpNumber: otpNumber,
        referenceCode: referenceCode,
        exipredAt: exipred,
      })
    })
  }

  verifyOTP(otp: string, referenceCode: string): Promise<boolean> {
    const secretToken = referenceCode;
    const isValid = this.authenticatorService.authenticator().verify({ token: otp, secret: secretToken });
    return new Promise((resolve, reject) => {
      resolve(isValid)
    })
  }

  generateReferenceCode(length: number,onlyNumber: boolean = false): Promise<string> {
    let result = '';
    const characters = onlyNumber ? '0123456789' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return new Promise((resolve, reject) => {
      resolve(result)
    });
  }

}
