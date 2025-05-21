import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LocalAuthService } from './local.auth.service';
import { some } from 'lodash';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private localAuthService: LocalAuthService) {
    super({ passReqToCallback: true });
  }

  async validate(req: any, username: string, password: string): Promise<any> {
    const user = await this.localAuthService.validateUser(username, password);
    const currentAppId = req?.oauthApp?.id || 0;
    if (!user) {
      throw new UnauthorizedException();
    }
    const isAllowApp = some(user.appCredentials, cred => cred.id === currentAppId)

    if (!isAllowApp) {
      throw new UnauthorizedException(`No permission to access this application`);
    }
    return user;
  }
}
