import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy, 'jwt_strategy') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // console.log('JwtStrategy validate', payload);
    return {
      adminConsoleId: payload.token_type === 'admin_console' ? payload.userId : null,
      userId: payload.userId,
      username: payload.username,
      token_type: payload.token_type === 'admin_console' ? payload.token_type : 'public',
      session: new Date(),
      scopes: payload.scopes || [],
      role: payload.roles || [],
    };
  }
}
