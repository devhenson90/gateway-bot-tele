import { Injectable, Logger } from '@nestjs/common';
import * as _ from 'lodash';
import axios from 'axios'
import { VerifyReCaptchaDTO } from './dto/recaptcha.dto';
import { ConfigService } from '@nestjs/config';

export const UserExcludeAttributes = ['password', 'pinCode'];

@Injectable()
export class RecaptchaService  {
  private reCaptchaConfig
  constructor(
    private configService: ConfigService,
  ) { 
    this.reCaptchaConfig = this.configService.get('RECAPTCHA_CONFIG')
  }

  async verifyreCaptcha(reCaptcha: VerifyReCaptchaDTO): Promise<VerifyReCaptchaDTO> {
    const reCaptchaResponse = await this.verifySiteReCaptcha(reCaptcha.response)
    return reCaptchaResponse
  }

  async verifySiteReCaptcha(responseReCaptcha: string): Promise<VerifyReCaptchaDTO> {
    const dataReCaptcha = await axios.post(`${this.reCaptchaConfig.RECAPTCHA_SITE_VERIFY}?secret=${this.reCaptchaConfig.RECAPTCHA_SECRET_KEY}&response=${responseReCaptcha}`)
    return {
      response: responseReCaptcha,
      success: dataReCaptcha.data?.success || false
    }
  }
}
