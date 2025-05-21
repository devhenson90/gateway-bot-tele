import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import { UserService } from 'src/oauth-bundle/user/user.service';

@Injectable()
export class JWTAuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async login(userPayload: any, rememberMe: boolean, expiresIn: string) {
    const payload = {
      username: userPayload.username,
      userId: userPayload.id,
      token_type: 'public',
    };
    const user = await this.userService.getUser(userPayload.username);
    const { password, ...result } = user;

    const expiresInJWT = {};

    if (expiresIn) {
      expiresInJWT['expiresIn'] = expiresIn;
    } else {
      expiresInJWT['expiresIn'] = '60m';
    }

    if (!rememberMe) {
      return {
        user: result,
        accessToken: this.jwtService.sign(payload, expiresInJWT),
      };
    }

    await this.cacheManager.del(userPayload.id);

    return {
      user: result,
      accessToken: this.jwtService.sign(payload, expiresInJWT),
      refreshToken: this.jwtService.sign(
        {
          userId: user.id,
          token_type: 'refresh',
        },
        { secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') },
      ),
    };
  }

  async logout(userPayload: any): Promise<string> {
    await this.cacheManager.set(userPayload.userId, 'logout', 0);
    return '';
  }
}
