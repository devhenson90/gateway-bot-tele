import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as CryptoJS from 'crypto-js';
import * as _ from 'lodash';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { Op } from 'sequelize';
import { AdminConsoleService } from 'src/oauth-bundle/admin-console/admin-console.service';
import { ApplicationScopeService } from 'src/oauth-bundle/application-scope/application-scope.service';
import { ApplicationScopeDTO } from 'src/oauth-bundle/application-scope/dto/application-scope.dto';
import { Status } from 'src/oauth-bundle/role/enum/status.enum';
import { TEMP_AUTH_CODE_STATUS, TMPAuthCodeDTO } from 'src/oauth-bundle/tmp-auth-code/dto/tmp-auth-code.dto';
import { VIEW as VIEW_USER_SCOPE } from 'src/oauth-bundle/user-scope/repositories/user-scope.repository';
import { UserScopeService } from 'src/oauth-bundle/user-scope/user-scope.service';
import { UserBLL } from 'src/oauth-bundle/user/bll/user.bll';
import { UserDTO } from 'src/oauth-bundle/user/dto/user.dto';
import {
  UserAssociationRepository,
  VIEW,
} from 'src/oauth-bundle/user/repositories/user-association.repository';
import { UserService } from 'src/oauth-bundle/user/user.service';
import { OAuthBLL } from './bll/oauth.bll';
import { AuthorizationDTO } from './dto/authorization.dto';

@Injectable()
export class OAuthService {
  constructor(
    @Inject(forwardRef(() => OAuthBLL))
    private readonly oAuthBLL: OAuthBLL,
    private readonly userService: UserService,
    private readonly userBLL: UserBLL,
    private readonly userAssociationRepository: UserAssociationRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminConsoleService: AdminConsoleService,
    private readonly applicationScopeService: ApplicationScopeService,
    private readonly userScopeService: UserScopeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  initUserDTO(dto: UserDTO) {
    dto.phone = this.userBLL.decryptAES(dto.phone);
    return dto;
  }

  async authorization(authorizationDTO: AuthorizationDTO) {
    const applicationScopeDTO = await this.oAuthBLL.getApplicationScope(
      authorizationDTO,
    );
    if (!applicationScopeDTO.id) {
      throw new BadRequestException();
    }

    // store initiate of tmpAuthCode with application scope
    const tmpAuthCodeDTO = await this.oAuthBLL.storeTMPAuthCode(
      applicationScopeDTO,
    );
    if (!tmpAuthCodeDTO.id) {
      throw new BadRequestException();
    }

    // return data to controller for redirect flow
    return {
      applicationScope: applicationScopeDTO,
      tmpAuthCode: tmpAuthCodeDTO,
    };
  }

  async login(
    userPayload: any,
    clientId: string,
    rememberMe: boolean,
    expiresIn: string,
    grantType: string,
  ) {
    // get application from clientId
    const applicationDTO = await this.oAuthBLL.getApplication(clientId);
    // throw if client id is incorrect
    if (!applicationDTO.id) {
      throw new BadRequestException();
    }

    // get tmpAuthCode stored from previous authorization process
    const tmpAuthCodeDTO = await this.oAuthBLL.getTMPAuthCodeByUserId(
      applicationDTO.id,
      userPayload.id,
    );
    // throw if latest tmp auth code is not exist or status is not incomplete
    if (!tmpAuthCodeDTO.id || tmpAuthCodeDTO.status !== TEMP_AUTH_CODE_STATUS.INCOMPLETE) {
      throw new BadRequestException();
    }

    const payload = {
      userId: userPayload.id,
      username: userPayload.username,
      token_type: 'public',
      scopes: [],
    };

    // build access token, refresh token
    for (let i = 0; i < tmpAuthCodeDTO.authToken.scopes.length; i++) {
      payload.scopes.push(tmpAuthCodeDTO.authToken.scopes[i]);
    }

    const user = await this.userService.getUser(userPayload.username);

    const jwtAccessTokenOption = {};
    if (expiresIn) {
      jwtAccessTokenOption['expiresIn'] = expiresIn;
    } else {
      jwtAccessTokenOption['expiresIn'] = '60m';
    }
    jwtAccessTokenOption['secret'] =
      tmpAuthCodeDTO.authToken.jwtTokenSecret;

    tmpAuthCodeDTO.authToken.accessToken = this.jwtService.sign(
      payload,
      jwtAccessTokenOption,
    );

    if (rememberMe) {
      tmpAuthCodeDTO.authToken.refreshToken = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          expiresIn: jwtAccessTokenOption['expiresIn'],
          token_type: 'refresh',
          scopes: payload.scopes,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        },
      );
    }

    delete tmpAuthCodeDTO.authToken.jwtTokenSecret;
    delete tmpAuthCodeDTO.authToken.jwtRefreshTokenSecret;

    if (grantType === 'authorization_code') {
      // grant type is token flag status encrypted
      tmpAuthCodeDTO.status = TEMP_AUTH_CODE_STATUS.ENCRYPTED;
    }
    else if (grantType === 'token') {
      // grant type is token flag status complete
      tmpAuthCodeDTO.status = TEMP_AUTH_CODE_STATUS.COMPLETE;
    }
    // update expired date in next 30 mins
    tmpAuthCodeDTO.expiredAt = new Date(Date.now() + 30 * 60 * 1000);

    const tmpAuthCodeUpdatedDTO = await this.oAuthBLL.updateTMPAuthcode(
      tmpAuthCodeDTO,
    );

    await this.cacheManager.del(userPayload.id);

    return {
      redirectUri: applicationDTO.redirectUri,
      tmpAuthCode: tmpAuthCodeUpdatedDTO,
    };
  }

  async loginAdminConsole(
    email: string,
    password: string,
    rememberMe: boolean,
    expiresIn: string,
  ) {
    const admin = await this.adminConsoleService.findOne({
      where: {
        email
      }
    });
    if (_.isEmpty(admin)) {
      return this.loginUser(email, password, rememberMe, expiresIn);
    }

    const payload = {
      userId: admin.id,
      username: email,
      token_type: 'admin_console',
      scopes: [],
    };

    const isPasswordMatch = await this.userService.compare(password, admin.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const mockApp = {
      scopes: []
    };

    await this.adminConsoleService.stampLoginEvent(admin.id);

    return {
      isMfaVerification: this.signJWTForMFA(true, admin.id),
      credential: this.signJWT(admin as any, mockApp as any, payload, rememberMe, expiresIn),
    };
  }

  async loginUser(
    email: string,
    password: string,
    rememberMe: boolean,
    expiresIn: string,
  ) {
    const user: any = await this.userAssociationRepository
      .include(VIEW.LOGIN_JWT).or(
        [
          { email: email },
          { username: email }
        ]
      ).and([
        {
          status: {
            [Op.eq]: Status.Enable
          }
        }
      ]).findOne();

    if (_.isEmpty(user)) {
      throw new UnauthorizedException();
    }

    const isPasswordMatch = await this.userService.compare(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      userId: user.id,
      username: user.email,
      isFirstLogin: user.isFirstLogin,
      token_type: 'public',
      scopes: [],
    };

    const clientId = [];
    user.appCredentials.map((item: any) => {
      clientId.push(item.clientId);
    })

    const userScope = await this.userScopeService.searchById(VIEW_USER_SCOPE.USER_SCOPE, user.id)

    if (userScope.length === 0) {
      throw new BadRequestException();
    }

    await this.cacheManager.del(user.id);

    this.userService.stampLoginEvent(user.id);

    return {
      isMfaVerification: this.signJWTForMFA(!user.isMfaVerification, user.id),
      credential: this.signJWT(user, userScope[0], payload, rememberMe, expiresIn),
    };
  }

  async loginPassword(
    userPayload: any,
    clientId: string,
    rememberMe: boolean,
    expiresIn: string,
  ) {
    // throw if client id is not exist
    if (!clientId) {
      throw new BadRequestException();
    }

    const payload = {
      userId: userPayload.id,
      username: userPayload.username,
      token_type: 'public',
      scopes: [],
    };

    const authDTO = new AuthorizationDTO();
    authDTO.clientId = clientId;

    const applicationScopeDTO = await this.oAuthBLL.getApplicationScope(authDTO);

    // throw if client id and client secret is incorrect
    if (!applicationScopeDTO.id) {
      throw new BadRequestException();
    }

    await this.cacheManager.del(userPayload.id);

    return {
      credential: this.signJWT(userPayload, applicationScopeDTO, payload, rememberMe, expiresIn),
    };
  }

  async loginClientCredential(
    clientId: string,
    nonce: string,
    signature: string,
    rememberMe: boolean,
    expiresIn: string,
  ) {
    // throw if client id and client secret is not exist
    if (!clientId || !signature) {
      throw new BadRequestException();
    }

    const authDTO = new AuthorizationDTO();
    authDTO.clientId = clientId;

    const applicationScopeDTO = await this.oAuthBLL.getApplicationScope(authDTO);

    const sha256 = CryptoJS.HmacSHA256(applicationScopeDTO.clientId + '###' + nonce,
      applicationScopeDTO.clientSecret,
    );
    const validateSignature = CryptoJS.enc.Hex.stringify(sha256);
    // throw if client id and client secret is incorrect
    if (!applicationScopeDTO.id || signature !== validateSignature) {
      throw new BadRequestException();
    }

    const user = await this.userService.read(
      applicationScopeDTO.userId.toString(),
    );

    const payload = {
      userId: user.id,
      username: user.username,
      token_type: 'public',
      scopes: [],
    };

    await this.cacheManager.del(user.id.toString());

    return {
      credential: this.signJWT(user, applicationScopeDTO, payload, rememberMe, expiresIn),
    };
  }

  async authorizationValidate(
    clientId: string,
    code: string,
    signature: string) {
    const applicationDTO = await this.oAuthBLL.getApplication(clientId);
    const tmpAuthCode: TMPAuthCodeDTO =
      await this.oAuthBLL.getTMPAuthCodeByCode(applicationDTO.id, code);

    // get tmpAuthCodeDTO for validate exist, expired,
    // encrypted auth data from previous process
    const now = new Date();
    const userTimezoneOffset = Math.abs(now.getTimezoneOffset() * 60000);

    let isValidate = true;
    if (!tmpAuthCode || tmpAuthCode.status !== TEMP_AUTH_CODE_STATUS.ENCRYPTED) {
      isValidate = false;
    }
    if (
      new Date().getTime() - userTimezoneOffset >
      new Date(Date.parse('' + tmpAuthCode.expiredAt)).getTime()
    ) {
      isValidate = false;
    }
    if (tmpAuthCode.encryptedAuthData !== signature) {
      isValidate = false;
    }

    if (!isValidate) {
      if (tmpAuthCode && tmpAuthCode.id) {
        this.oAuthBLL.deleteTMPAuthcode(tmpAuthCode.id);
      }
      throw new BadRequestException();
    }

    tmpAuthCode.status = TEMP_AUTH_CODE_STATUS.COMPLETE;

    // flag status complete and return token
    const tmpAuthCodeDTO = await this.oAuthBLL.updateTMPAuthcode(tmpAuthCode);

    return tmpAuthCodeDTO.authToken;
  }

  signJWT(
    user: any,
    applicationScopeDTO: ApplicationScopeDTO,
    payload: any,
    rememberMe: boolean,
    expiresIn: string
  ): any {
    const credential = { roles: [], scopes: [], isFirstLogin: false, accessToken: '', refreshToken: '' };
    const jwtAccessTokenOption = {};
    if (expiresIn) {
      jwtAccessTokenOption['expiresIn'] = expiresIn;
    } else {
      jwtAccessTokenOption['expiresIn'] = '60m';
    }

    let authScopeIdx: number;
    // build access token, refresh token
    for (let i = 0; i < applicationScopeDTO.scopes.length; i++) {
      if (applicationScopeDTO.scopes[i].type === 'auth') {
        authScopeIdx = i
      }
      payload.scopes.push({
        scope: applicationScopeDTO.scopes[i].scope,
        hostName: applicationScopeDTO.scopes[i].hostName,
        urlPath: applicationScopeDTO.scopes[i].urlPath,
      });
    }

    // jwtAccessTokenOption['secret'] = applicationScopeDTO.scopes[authScopeIdx].jwtTokenSecret;
    jwtAccessTokenOption['secret'] = this.configService.get<string>('JWT_SECRET')

    payload.roles = user.roles;

    credential.roles = payload.roles;
    credential.scopes = payload.scopes;
    credential.accessToken = this.jwtService.sign(
      payload,
      jwtAccessTokenOption,
    );
    if (payload.isFirstLogin) {
      credential.isFirstLogin = payload.isFirstLogin;
    }
    if (rememberMe) {
      credential.refreshToken = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          expiresIn: jwtAccessTokenOption['expiresIn'],
          token_type: 'refresh',
          scopes: payload.scopes,
          token_user: payload.token_type
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: '1d',
        },
      );
    }

    return credential;
  }

  async logout(userPayload: any): Promise<string> {
    if (userPayload.adminConsoleId) {
      await this.adminConsoleService.stampLastActiveEvent(userPayload.adminConsoleId);
    } else {
      await this.userService.stampLastActiveEvent(userPayload.userId);
    }
    await this.cacheManager.set(userPayload.userId, 'logout', 0);
    return '';
  }

  async userLoginPassword(
    userPayload: any,
    clientId: string,
    rememberMe: boolean,
    expiresIn: string,
  ) {
    // throw if client id is not exist
    if (!clientId) {
      throw new BadRequestException();
    }

    const payload = {
      userId: userPayload.id,
      username: userPayload.username,
      token_type: 'public',
      scopes: [],
    };

    const clientIds = [];
    userPayload.appCredentials.map((item: any) => {
      clientIds.push(item.clientId);
    })

    const userScope = await this.userScopeService.searchById(VIEW_USER_SCOPE.USER_SCOPE, userPayload.id)

    if (userScope.length === 0) {
      throw new BadRequestException();
    }

    await this.cacheManager.del(userPayload.id);

    this.userService.stampLoginEvent(userPayload.id);

    return {
      credential: this.signJWT(userPayload, userScope[0], payload, rememberMe, expiresIn),
    };
  }

  async checkTwoFactorAuthentication(userId: number) {
    const isMfaVerification = await this.userService.isMfaVerification(userId);
    if (!isMfaVerification) {
      throw new BadRequestException('DISABLED_2FA');
    } else {
      throw new BadRequestException('REGENERATE_2FA');
    }
  }

  async generateTwoFactorAuthenticationSecret(userId: number) {
    const secret = authenticator.generateSecret();

    const user = await this.userService.read(userId.toString());
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otpauthUrl = authenticator.keyuri(user.email, this.configService.get<string>('MODULE'), secret);

    await this.userService.setTwoFactorAuthenticationSecret(secret, userId);

    return await this.generateQrCodeDataURL(otpauthUrl);
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, userId: number) {
    const user = await this.userService.read(userId.toString());
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const userData = await this.userService.readByUserEmail(user.email);
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: userData.twoFactorSecret,
    });
  }

  async setIsMfaEnabled(userId: number, isMfaEnabled: boolean) {
    await this.userService.setIsMfaEnabled(isMfaEnabled, userId);
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    await this.userService.turnOnMfa(userId);
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    await this.userService.turnOffMfa(userId);
  }

  signJWTForMFA(isMfaPass: boolean, userId: number): any {
    const payload = {
      isMFAPass: isMfaPass,
      userId: userId,
      token_type: 'mfa',
      iat: Math.floor(Date.now() / 1000),
    };

    const jwtAccessTokenOption = {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    }

    const token = this.jwtService.sign(payload, jwtAccessTokenOption);

    return token;
  }
}
