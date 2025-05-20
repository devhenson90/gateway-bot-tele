import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { JWTAuthService } from 'artifacts/auth/jwt/jwt.auth.service';
import { LocalAuthGuard } from 'artifacts/auth/local/local.auth.guard';
import { Public } from './metadata/public.metadata';
import { JWTRefreshTokenAuthGuard } from './refresh-token/jwt-refresh-token.auth.guard';
import { JWTRefreshTokenAuthService } from './refresh-token/jwt-refresh-token.auth.service';

@Controller('/v1')
export class AuthController {
  constructor(
    private readonly jwtAuthService: JWTAuthService,
    private readonly jwtRefreshTokenAuthService: JWTRefreshTokenAuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('local/auth/login')
  async localLogin(@Request() req) {
    return req.user;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('jwt/auth/login')
  async jwtLogin(@Request() req, @Body() credentials: any) {
    return this.jwtAuthService.login(
      req.user,
      credentials.remember_me,
      credentials.expires_in,
    );
  }

  @Public()
  @UseGuards(JWTRefreshTokenAuthGuard)
  @Get('jwt/auth/refresh_token')
  async jwtRefreshToken(@Request() req) {
    return this.jwtRefreshTokenAuthService.refreshToken(req.user);
  }

  @Public()
  @UseGuards(JWTRefreshTokenAuthGuard)
  @Get('jwt/auth/logout')
  async jwtLogout(@Request() req) {
    return this.jwtAuthService.logout(req.user);
  }
}
