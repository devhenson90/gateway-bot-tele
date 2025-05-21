import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { Status } from 'src/oauth-bundle/role/enum/status.enum';
import { VIEW as VIEW_USER_SCOPE } from 'src/oauth-bundle/user-scope/repositories/user-scope.repository';
import { UserScopeService } from 'src/oauth-bundle/user-scope/user-scope.service';
import { UserAssociationRepository, VIEW as VIEW_USER_ASSO } from 'src/oauth-bundle/user/repositories/user-association.repository';
import { UserService } from 'src/oauth-bundle/user/user.service';
import { OAuthBLL } from '../bll/oauth.bll';

@Injectable()
export class OAuthJWTRefreshTokenAuthService {
  constructor(
    private readonly oAuthBLL: OAuthBLL,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userAssociationRepository: UserAssociationRepository,
    private readonly userScopeService: UserScopeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async refreshToken(userPayload: any) {
    if ((await this.cacheManager.get(userPayload.userId)) === 'logout') {
      throw new UnauthorizedException();
    }

    const scopeMasterDTO = await this.oAuthBLL.getScopeMaster(
      userPayload.scope,
    );

    const user = await this.userService.read(userPayload.userId);
    // const { password, ...result } = user;

    const payload = {
      username: user.username,
      userId: userPayload.userId,
      token_type: 'public',
      scope: userPayload.scope,
    };

    const jwtAccessTokenOption = {};
    jwtAccessTokenOption['expiresIn'] = userPayload.expiresIn;
    jwtAccessTokenOption['secret'] = scopeMasterDTO.jwtTokenSecret;

    return {
      // user: result,
      credentials: {
        accessToken: this.jwtService.sign(payload, jwtAccessTokenOption),
        // refreshToken: this.jwtService.sign({ message: 'auth' }),
      },
    };
  }

  async refreshUserToken(userPayload: any) {
    if ((await this.cacheManager.get(userPayload.userId)) === 'logout') {
      throw new UnauthorizedException();
    }

    const user = await this.userService.read(userPayload.userId);

    const userInfo: any = await this.userAssociationRepository
      .include(VIEW_USER_ASSO.LOGIN_JWT)
      .and([
        {
          status: {
            [Op.eq]: Status.Enable
          }
        }
      ])
      .findOne({
        where: {
          ...(user.email ? { email: user.email } : {}),
        },
      });

    if (_.isEmpty(user)) {
      throw new UnauthorizedException();
    }

    const payload = {
      userId: userPayload.userId,
      username: user.email,
      isFirstLogin: user.isFirstLogin,
      token_type: 'public',
      scopes: [],
      roles: []
    };

    const clientId = [];
    userInfo.appCredentials.map((item: any) => {
      clientId.push(item.clientId);
    })

    const userScope = await this.userScopeService.searchById(VIEW_USER_SCOPE.USER_SCOPE, userPayload.userId)

    if (userScope.length === 0) {
      throw new UnauthorizedException();
    }

    for (let i = 0; i < userScope[0].scopes.length; i++) {
      payload.scopes.push({
        scope: userScope[0].scopes[i].scope,
        hostName: userScope[0].scopes[i].hostName,
        urlPath: userScope[0].scopes[i].urlPath,
      });
    }

    payload.roles = userInfo.roles;

    const jwtAccessTokenOption = {};
    jwtAccessTokenOption['expiresIn'] = userPayload.expiresIn;
    jwtAccessTokenOption['secret'] = this.configService.get<string>('JWT_SECRET')

    return {
      credentials: {
        accessToken: this.jwtService.sign(payload, jwtAccessTokenOption),
      },
    };
  }

  async refreshExUserToken(userPayload: any) {
    if ((await this.cacheManager.get(userPayload.userId)) === 'logout') {
      throw new UnauthorizedException();
    }

    const user = await this.userService.read(userPayload.userId);

    const userInfo: any = await this.userAssociationRepository
      .include(VIEW_USER_ASSO.LOGIN_JWT)
      .and([
        {
          status: {
            [Op.eq]: Status.Enable
          }
        }
      ])
      .findOne({
        where: {
          ...(user.email ? { email: user.email } : {}),
        },
      });

    if (_.isEmpty(user)) {
      throw new UnauthorizedException();
    }

    const payload = {
      userId: userPayload.userId,
      username: user.username,
      token_type: 'public',
      scopes: [],
      roles: []
    };

    const clientId = [];
    userInfo.appCredentials.map((item: any) => {
      clientId.push(item.clientId);
    })

    const userScope = await this.userScopeService.searchById(VIEW_USER_SCOPE.USER_SCOPE, userPayload.userId)

    if (userScope.length === 0) {
      throw new UnauthorizedException();
    }

    for (let i = 0; i < userScope[0].scopes.length; i++) {
      payload.scopes.push({
        scope: userScope[0].scopes[i].scope,
        hostName: userScope[0].scopes[i].hostName,
        urlPath: userScope[0].scopes[i].urlPath,
      });
    }

    payload.roles = userInfo.roles;

    const jwtAccessTokenOption = {};
    jwtAccessTokenOption['expiresIn'] = userPayload.expiresIn;
    jwtAccessTokenOption['secret'] = this.configService.get<string>('JWT_SECRET')

    return {
      credentials: {
        accessToken: this.jwtService.sign(payload, jwtAccessTokenOption),
      },
    };
  }
}
