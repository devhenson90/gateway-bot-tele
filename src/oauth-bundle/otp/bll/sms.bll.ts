import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SMSDTO, SMSResultDTO } from '../dto/sms.dto';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import * as _ from 'lodash';
import { SmsConfigurationService } from 'src/oauth-bundle/sms-configuration/enum/enum';
import { SmsConfigurationDTO } from 'src/oauth-bundle/sms-configuration/dto/dto';

const ServiceConfigDefinition = (cfg: SmsConfigurationDTO) => {
  switch (cfg.service) {
    case SmsConfigurationService.SMSMKT:
      return {
        SMS: {
          apiKey: cfg.apiKey,
          apiSecret: cfg.secretKey,
          senderID: cfg.sender,
          sendSMSAPI: 'https://portal-otp.smsmkt.com/api/send-message',
        },
        SMS_INTER: {
          apiKey: cfg.apiKey,
          apiSecret: cfg.secretKey,
          senderID: cfg.sender,
          sendSMSAPI: 'https://api-inter.smsmkt.com/api/inter/send/message',
        },
      };
  }
  return null;
};

export interface SMSConfig {
  apiKey: string;
  apiSecret: string;
  senderID: string;
  sendSMSAPI: string;
}

@Injectable()
export class SMSBLL {

  selectLocalInterProvider(cfg: SmsConfigurationDTO, phone: string): SMSConfig {
    if (_.startsWith(phone, '+')) {
      return ServiceConfigDefinition(cfg)?.['SMS_INTER'];
    }
    return ServiceConfigDefinition(cfg)?.['SMS'];
  }

  createBaseAPI(smsConfig: SMSConfig) {
    const instance = axios.create({
      baseURL: smsConfig.sendSMSAPI,
      timeout: 30000,
      headers: {
        ['api_key']: smsConfig.apiKey,
        ['secret_key']: smsConfig.apiSecret,
      },
    });
    return instance;
  }

  async sendSMS(smsData: SMSDTO): Promise<SMSResultDTO> {
   
    try {
      const smsConfig = this.selectLocalInterProvider(smsData.smsConfiguration, smsData.phone);

      const smsBody = {
        phone: smsData.phone,
        message: smsData.message,
        sender: smsConfig.senderID,
      };

      const axiosProvider = this.createBaseAPI(smsConfig);

      const smsResult = await axiosProvider.post<any>(
        '',
        smsBody,
      );
      if (smsResult?.data?.code === '000') {
        // console.log('SMS - Success',smsResult?.data)
        return new Promise((resolve) => {
          resolve(
            new SMSResultDTO({
              statusSent: true,
              prettyMessage: 'OK',
            }),
          );
        });
      } else {
        // console.log('SMS - Error',smsResult?.data)
        return new Promise((resolve) => {
          resolve(
            new SMSResultDTO({
              statusSent: false,
              prettyMessage: smsResult?.data?.detail,
            }),
          );
        });
      }
    } catch (err: any) {
      // console.log('SMS - Catch',err)
      return new Promise((resolve) => {
        resolve(
          new SMSResultDTO({
            statusSent: false,
            prettyMessage: 'SMS API timeout',
          }),
        );
      });
    }
  }
}
