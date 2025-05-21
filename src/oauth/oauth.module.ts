import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { LocalAuthService } from 'artifacts/auth/local/local.auth.service';
import { LocalStrategy } from 'artifacts/auth/local/local.strategy';
import { TCP_SERVICE } from 'artifacts/microservices/tcp/tcp.constants';
import { AdminConsoleModule } from 'src/oauth-bundle/admin-console/admin-console.module';
import { ApplicationScopeModule } from 'src/oauth-bundle/application-scope/application-scope.module';
import { UserScopeModule } from 'src/oauth-bundle/user-scope/user-scope.module';
import { UserModule } from 'src/oauth-bundle/user/user.module';
import { OAuthBLL } from './bll/oauth.bll';
import { OAuthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { OAuthJWTRefreshTokenAuthService } from './refresh-token/oauth.jwt-refresh-token.auth.service';
import { OAuthJWTRefreshTokenStrategy } from './refresh-token/oauth.jwt-refresh-token.strategy';

@Module({
  imports: [
    UserModule,
    AdminConsoleModule,
    ApplicationScopeModule,
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
    ClientsModule.registerAsync([
      {
        name: TCP_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            port: configService.get<number>('MICROSERVICE_PORT'),
            host: configService.get<string>('HOST'),
          },
        }),
      },
    ]),
    UserScopeModule
  ],
  controllers: [OAuthController],
  providers: [
    OAuthBLL,
    OAuthService,
    LocalAuthService,
    LocalStrategy,
    OAuthJWTRefreshTokenAuthService,
    OAuthJWTRefreshTokenStrategy,
  ],
})
export class OAuthModule { }
