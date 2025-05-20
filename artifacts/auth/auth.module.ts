import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JWTStrategy } from './jwt/jwt.strategy';
import { JWTAuthGuard } from './jwt/jwt.auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { LocalAuthService } from './local/local.auth.service';
import { JWTAuthService } from './jwt/jwt.auth.service';
import { JWTRefreshTokenAuthService } from './refresh-token/jwt-refresh-token.auth.service';
import { LocalStrategy } from './local/local.strategy';
import { JWTRefreshTokenStrategy } from './refresh-token/jwt-refresh-token.strategy';
import { PublicSignatureAuthGuard } from './public-signature/public-signature.auth.guard';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/oauth-bundle/user/user.module';
import { ApplicationModule } from 'src/oauth-bundle/application/application.module';

@Module({
  imports: [
    ApplicationModule,
    UserModule,
    // ConfigModule,
    CacheModule.register({
      ttl: null,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    LocalAuthService,
    JWTAuthService,
    JWTRefreshTokenAuthService,
    LocalStrategy,
    JWTStrategy,
    JWTRefreshTokenStrategy,
    PublicSignatureAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JWTAuthGuard,
    },
  ],
})
export class AuthModule {}
