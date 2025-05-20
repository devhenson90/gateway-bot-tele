import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Redirect,
  Request,
  Res,
  Session,
  UseGuards
} from '@nestjs/common';
import { Jwt2faAuthGuard } from 'artifacts/auth/jwt2fa/jwt-2fa-auth.guard';
import { LocalAuthGuard } from 'artifacts/auth/local/local.auth.guard';
import { OAuthAppReq, Public } from 'artifacts/auth/metadata/public.metadata';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { UserImpersonateUserId } from 'src/common/helpers/user.helper';
import { AuthorizationDTO } from './dto/authorization.dto';
import { OAuthService } from './oauth.service';
import { OAuthJWTRefreshTokenAuthGuard } from './refresh-token/oauth.jwt-refresh-token.auth.guard';
import { OAuthJWTRefreshTokenAuthService } from './refresh-token/oauth.jwt-refresh-token.auth.service';

@Controller('/v1')
export class OAuthController {
  constructor(
    private readonly oAuthService: OAuthService,
    private readonly oAuthJwtRefreshTokenAuthService: OAuthJWTRefreshTokenAuthService,
  ) { }

  @Public()
  @Get('authorization')
  @Redirect()
  async authorization(@Session() session: Record<string, any>,
    @Query() authorizationDTO: AuthorizationDTO) {
    if (session.csrf === undefined) {
      session.csrf = randomBytes(100).toString('base64');
    }

    const authData = await this.oAuthService.authorization(authorizationDTO);
    const applicationScopeDTO = authData.applicationScope;

    const redirectUrl = new URL(applicationScopeDTO.redirectUri);
    const searchParams = redirectUrl.searchParams;

    searchParams.set('clientId', applicationScopeDTO.clientId);
    searchParams.set('responseType', authorizationDTO.responseType);
    searchParams.set('grantType', authorizationDTO.grantType);
    searchParams.set('state', session.csrf);

    return {
      url: redirectUrl.href
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('jwt/oauth/authorization-code/login')
  @Redirect()
  async jwtLoginAuthCode(@Request() req, @Body() credentials: any) {
    if (!req.headers.csrf || req.headers.csrf !== req.session.csrf) {
      throw new BadRequestException();
    }
    const redirectResult = await this.oAuthService.login(
      req.user,
      credentials.clientId,
      credentials.remember_me,
      credentials.expires_in,
      'authorization_code',
    );

    const redirectUrl = new URL(redirectResult.redirectUri);
    const searchParams = redirectUrl.searchParams;

    searchParams.set('code', redirectResult.tmpAuthCode.code);

    return {
      url: redirectUrl.href
    };
  }

  @Public()
  @Get('authorization/validate/:clientId/:code/:signature')
  async authorizationValidate(
    @Param('clientId') clientId: string,
    @Param('code') code: string,
    @Param('signature') signature: string,
  ) {
    const authToken = await this.oAuthService.authorizationValidate(
      clientId,
      code,
      signature,
    );
    return { credential: authToken };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('jwt/oauth/implicit/login')
  async jwtLoginToken(@Request() req, @Body() credentials: any) {
    const redirectResult = await this.oAuthService.login(
      req.user,
      credentials.clientId,
      credentials.remember_me,
      credentials.expires_in,
      'token',
    );
    return { credential: redirectResult.tmpAuthCode.authToken };
  }

  @OAuthAppReq()
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('jwt/oauth/password/login')
  async jwtLoginPassword(@Request() req, @Body() credentials: any) {
    return await this.oAuthService.loginPassword(
      req.user,
      credentials.clientId,
      credentials.remember_me,
      credentials.expires_in,
    );
  }

  @Public()
  @Post('jwt/oauth/admin-console/login')
  async jwtAdminConsoleLogin(@Body() credentials: any, @Res() res: Response) {
    const authToken = await this.oAuthService.loginAdminConsole(
      credentials.email,
      credentials.password,
      credentials.remember_me,
      credentials.expires_in,
    );

    res.cookie('isMFAPass', authToken.isMfaVerification, { httpOnly: true, secure: true, sameSite: 'strict' });

    return res.json({ credential: authToken.credential });
  }

  @Public()
  @Post('jwt/oauth/client-credential/login')
  async jwtLoginClientCredential(@Body() credentials: any) {
    return await this.oAuthService.loginClientCredential(
      credentials.clientId,
      credentials.nonce,
      credentials.signature,
      credentials.remember_me,
      credentials.expires_in,
    );
  }

  @Public()
  @UseGuards(OAuthJWTRefreshTokenAuthGuard)
  @Get('authorization/jwt/auth/refresh_token')
  async jwtRefreshToken(@Request() req) {
    return this.oAuthJwtRefreshTokenAuthService.refreshToken(req.user);
  }

  @Public()
  @UseGuards(OAuthJWTRefreshTokenAuthGuard)
  @Get('authorization/jwt/auth/user/refresh_token')
  async jwtRefreshUserToken(@Request() req) {
    return this.oAuthJwtRefreshTokenAuthService.refreshUserToken(req.user);
  }

  @Public()
  @UseGuards(OAuthJWTRefreshTokenAuthGuard)
  @Get('authorization/jwt/auth/logout')
  async jwtLogout(@Request() req, @Res() res: Response) {
    res.clearCookie('isMFAPass', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    await this.oAuthService.logout(req.user);
    return res.json('');
  }

  @Public()
  @Get('login')
  async login(@Session() session: Record<string, any>,
    @Request() req,
    @Res() res: Response, @Query() authorizationDTO: AuthorizationDTO) {
    // if (!session.csrf) {
    //   throw new BadRequestException();
    // }
    res.render('login', {
      // code: req.query.code,
      // csrfToken: session.csrf
    });
  }

  @OAuthAppReq()
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('jwt/oauth/password/ex-user-login')
  async jwtExUserLoginPassword(@Request() req, @Body() credentials: any) {
    return await this.oAuthService.userLoginPassword(
      req.user,
      credentials.clientId,
      true,
      '15m',
    );
  }

  @Public()
  @UseGuards(OAuthJWTRefreshTokenAuthGuard)
  @Get('authorization/jwt/auth/ex-user/refresh_token')
  async jwtRefreshExUserToken(@Request() req) {
    return this.oAuthJwtRefreshTokenAuthService.refreshExUserToken(req.user);
  }

  @Get('/2fa/check')
  @UseGuards(Jwt2faAuthGuard)
  async check2fa(@Request() request) {
    const user = UserImpersonateUserId(request);
    return await this.oAuthService.checkTwoFactorAuthentication(user);
  }

  @Get('/2fa/generate-qr')
  @UseGuards(Jwt2faAuthGuard)
  async generateQRCode(@Request() request) {
    const user = UserImpersonateUserId(request);
    const qrCodeUrl = await this.oAuthService.generateTwoFactorAuthenticationSecret(user);
    return { qrCodeUrl };
  }

  @Get('/2fa/regenerate-qr')
  async regenerateQRCode(@Request() request) {
    const user = UserImpersonateUserId(request);
    await this.oAuthService.setIsMfaEnabled(user, false);
    const qrCodeUrl = await this.oAuthService.generateTwoFactorAuthenticationSecret(user);
    return { qrCodeUrl };
  }

  @Post('/2fa/turn-on')
  async turnOn2fa(@Request() request, @Body() body, @Res() res: Response) {
    const user = UserImpersonateUserId(request);
    const isCodeValid =
      await this.oAuthService.isTwoFactorAuthenticationCodeValid(
        body.token,
        user,
      );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }

    await this.oAuthService.turnOnTwoFactorAuthentication(user);

    return res.json({ message: 'Two-factor authentication successful' });
  }

  @Post('/2fa/turn-off')
  async turnOff2fa(@Request() request, @Body() body, @Res() res: Response) {
    const user = UserImpersonateUserId(request);
    await this.oAuthService.turnOffTwoFactorAuthentication(user);

    return res.json({ message: 'Two-factor authentication disabled' });
  }

  @Post('/2fa/verify')
  async verify2fa(@Request() request, @Body() body, @Res() res: Response) {
    const user = UserImpersonateUserId(request);
    const isCodeValid =
      await this.oAuthService.isTwoFactorAuthenticationCodeValid(
        body.token,
        user,
      );
    if (!isCodeValid) {
      res.cookie('isMFAPass', this.oAuthService.signJWTForMFA(false, user), { httpOnly: true, secure: true, sameSite: 'strict' });
      throw new BadRequestException('Wrong authentication code');
    }

    await this.oAuthService.setIsMfaEnabled(user, true);
    res.cookie('isMFAPass', this.oAuthService.signJWTForMFA(true, user), { httpOnly: true, secure: true, sameSite: 'strict' });

    return res.json({ message: 'Two-factor authentication successful' });
  }
}
