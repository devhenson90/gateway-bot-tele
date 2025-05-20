import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { ApplicationService } from 'src/oauth-bundle/application/application.service';

@Injectable()
export class PublicSignatureAuthGuard implements CanActivate {
  private authKey: any;
  private jwtSecret: string;

  constructor(
    private readonly applicationService: ApplicationService,
    configService: ConfigService,
  ) {
    this.authKey = configService.get<string>('AUTH_KEY');
    this.jwtSecret = configService.get<string>('JWT_SECRET');

    // const sha256 = CryptoJS.HmacSHA256(
    //   configService.get<string>('AUTH_PUBLIC_KEY') + '_' + new Date().getTime(),
    //   configService.get<string>('AUTH_PUBLIC_KEY'),
    // );
    // const nonce = CryptoJS.enc.Base64.stringify(sha256);
    // console.log(
    //   'example nonce',
    //   nonce,
    //   configService.get<string>('AUTH_PUBLIC_KEY') + '_' + new Date().getTime(),
    // );
  }

  async canActivate(
    context: ExecutionContext,
  ): Promise<any> {
    const request = context.switchToHttp().getRequest();
    if (!_.isEmpty(request.headers.signature)) {
      return this.validateRequest(request, context);
    } else {
      return this.externalValidateRequest(request);
    }
  }

  validateRequest(request: any, context: ExecutionContext) {
    // console.log('request', request);
    // console.log('request headers', request.headers);
    // console.log('method', request.method);
    console.log('path', request.path);
    console.log('body', request.body);
    console.log('request signature', request.headers.signature);
    console.log('nonce', request.headers.nonce);
    console.log('public_key', request.headers.public_key);
    console.log('private_key', this.authKey[request.headers.public_key]);

    const isMFAPass = request.cookies?.isMFAPass;

    const res = context.switchToHttp().getResponse();
    try {
      const decoded = jwt.verify(isMFAPass, this.jwtSecret) as jwt.JwtPayload;

      if (!decoded || !decoded.isMFAPass) {
        res.clearCookie('isMFAPass', {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
        });
        throw new UnauthorizedException('MFA verification required');
      }
    } catch (err) {
      res.clearCookie('isMFAPass', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
      throw new UnauthorizedException('MFA verification required');
    }

    if (!this.authKey[request.headers.public_key]) {
      return false;
    }

    const sha256 = CryptoJS.HmacSHA256(
      request.path +
      '.' +
      JSON.stringify(request.body) +
      '.' +
      request.headers.nonce,
      this.authKey[request.headers.public_key],
    );

    const signature = CryptoJS.enc.Hex.stringify(sha256);
    console.log('signature', signature);

    if (signature !== request.headers.signature) {
      return false;
    }

    return true;
  }

  async externalValidateRequest(request: any): Promise<any> {
    if (_.isEmpty(request.headers.public_key)) {
      return false;
    }

    const app = await this.applicationService.readByClientId(request.headers.public_key);

    if (_.isEmpty(app)) {
      return false;
    }

    const sha256 = CryptoJS.HmacSHA256(
      request.path +
      '.' +
      JSON.stringify(request.body) +
      '.' +
      request.headers.nonce,
      app.clientSecret,
    );

    const signature = CryptoJS.enc.Hex.stringify(sha256);

    if (signature !== request.headers['x-signature']) {
      return false;
    }

    return true;
  }
}
