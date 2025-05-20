import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class OAuthJWTRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt_refresh_token_strategy',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // console.log('JwtRefreshTokenStrategy validate', payload);
    return {
      adminConsoleId: payload.token_user === 'admin_console' ? payload.userId : null,
      userId: payload.userId,
      scopes: payload.scopes,
      expiresIn: payload.expiresIn,
      token_type: 'refresh',
      session: new Date(),
    };
  }
}
