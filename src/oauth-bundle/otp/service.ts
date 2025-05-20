import { Injectable, BadRequestException } from '@nestjs/common';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { OtpDTO } from './dto/dto';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { OtpSearchDTO } from './dto/search.dto';
import { SMSDTO, SMSResultDTO } from './dto/sms.dto';
import { VerifyOTPDTO, VerifyOTPResultDTO } from './dto/verify-otp.dto';
import { OTPBLL } from './bll/otp.bll';
import { SMSBLL } from './bll/sms.bll';
import { ApplicationDTO } from '../application/dto/application.dto';
import { SmsConfigurationDTO } from '../sms-configuration/dto/dto';
import { ResponseException } from 'src/common/exception/response.exception';
import { SmsConfigurationRepository } from '../sms-configuration/repositories/repository';

@Injectable()
export class OtpService {

  private readonly IOS_PHONE_MOCKING: string = '+15740012973';
  private readonly IOS_REF_CODE_MOCKING: string = 'ZXCVB';
  private readonly IOS_OTP_MOCKING: string = '741258';

  constructor(
    private readonly tcpService: TCPService,
    private readonly otpBLL: OTPBLL,
    private readonly smsBLL: SMSBLL,
    private readonly smsConfigurationRepository: SmsConfigurationRepository,
  ) {
    this.tcpService.addTCPMessageHandler('otpservice', this);
  }

  buildOtpMessage(otpResult: Partial<VerifyOTPDTO>, message: string) {
    let retMessage = message;
    retMessage = retMessage.replace(/:OTP_NUMBER/g, otpResult.otpNumber);
    retMessage = retMessage.replace(/:REF_CODE/g, otpResult.referenceCode);
    return retMessage;
  }

  async verify(dto: VerifyOTPDTO): Promise<VerifyOTPResultDTO> {
    const isValid = await this.otpBLL.verifyOTP(
      dto.otpNumber,
      dto.referenceCode,
    );
    if (
      dto.referenceCode === this.IOS_REF_CODE_MOCKING &&
      dto.otpNumber === this.IOS_OTP_MOCKING
    ) {
      return new VerifyOTPResultDTO({ isValid: true });
    }
    return new VerifyOTPResultDTO({ isValid });
  }

  async sendSMS(oauthApp: ApplicationDTO, message: string, phone: string): Promise<SMSResultDTO> {
    const smsConfigurationId = oauthApp?.smsConfigurationId;
    let smsConfiguration: SmsConfigurationDTO;
    if (smsConfigurationId) {
      const result = await this.smsConfigurationRepository.findOne({
        where: {
          id: smsConfigurationId,
        }
      });
      smsConfiguration = result ? new SmsConfigurationDTO(result) : null;
    }
    if (!smsConfiguration) {
      throw new ResponseException('Cannot find SMS configuration for this application');
    }
    const otpResult = await this.otpBLL.generateOTP();
    const otpMessage = this.buildOtpMessage(otpResult, message);

    if (phone === this.IOS_PHONE_MOCKING) {
      otpResult.referenceCode = this.IOS_REF_CODE_MOCKING;

      const smsResult = new SMSResultDTO({
        statusSent: true,
        prettyMessage: 'OK',
      });
      smsResult.referenceCode = otpResult.referenceCode;
      smsResult.exipredAt = otpResult.exipredAt;
      return smsResult;
    }

    const smsResult = await this.smsBLL.sendSMS(
      new SMSDTO({
        phone: phone,
        message: otpMessage,
        smsConfiguration,
      }),
    );
    smsResult.referenceCode = otpResult.referenceCode;
    smsResult.exipredAt = otpResult.exipredAt;
    return smsResult;
  }
}
