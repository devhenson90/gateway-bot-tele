import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt_refresh_token_strategy',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // console.log('JwtRefreshTokenStrategy validate', payload);
    return {
      userId: payload.userId,
      token_type: 'refresh',
      session: new Date(),
    };
  }
}
