import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { CLS_KEY } from 'artifacts/cls/cls.client';
import * as _ from 'lodash';
import { ClsService } from 'nestjs-cls';
import { ResponseException } from 'src/common/exception/response.exception';
import { ClientId } from 'src/common/helpers/app.helper';
import { ApplicationService } from 'src/oauth-bundle/application/application.service';
import { IS_OAUTH_APP_REQ, IS_PUBLIC_KEY } from '../metadata/public.metadata';
import { agentRules } from '../rules/agent.rules';
import { MethodEnum, SCOPE_ALLOWED } from '../rules/enums';
import { gatewayRules } from '../rules/gateway.rules';
import { merchantRules } from '../rules/merchant.rules';
import { whitelistPaths } from '../rules/rules';

const rulesMap = {
  [SCOPE_ALLOWED.GATEWAY_SERVICE]: gatewayRules,
  [SCOPE_ALLOWED.MERCHANT_SERVICE]: merchantRules,
  [SCOPE_ALLOWED.AGENT_SERVICE]: agentRules,
};

@Injectable()
export class JWTAuthGuard extends AuthGuard('jwt_strategy') {
  constructor(
    private reflector: Reflector,
    private readonly cls: ClsService,
    private readonly applicationService: ApplicationService,
  ) {
    super();
  }

  async setApplication(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const isCheckApplication = this.reflector.getAllAndOverride<boolean>(
      IS_OAUTH_APP_REQ,
      [context.getHandler(), context.getClass()],
    );
    if (!isCheckApplication) {
      return;
    }

    const clientId = ClientId(request);
    if (clientId) {
      const app = await this.applicationService.readByClientId(clientId);
      if (!app.id) {
        throw new ResponseException(
          `Cannot find the application`,
        );
      }
      request.oauthApp = app;
    }
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    await this.setApplication(context);

    // Add your custom authentication logic here
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info, ctx: ExecutionContext) {
    // You can throw an exception based on either "info" or "err" arguments
    // console.log('JWTAuthGuard handleRequest', user, info);
    if (
      (err ||
        !user ||
        !user.userId ||
        !user.username ||
        !user.token_type ||
        user.token_type !== 'public' ||
        !this.validateAuthority(user, ctx)) && user.token_type !== 'admin_console'
    ) {
      throw err || new UnauthorizedException();
    }
    this.cls.set(CLS_KEY.REQ_USER, user);
    return user;
  }

  validateAuthority(user: any, ctx: ExecutionContext): Boolean {
    const request = ctx.switchToHttp().getRequest<Request>();
    const canAccess = this.canUserAccessApi(user.scopes, request.url, request.method as MethodEnum);
    if (canAccess) {
      return true;
    }

    throw new ForbiddenException();
  }

  canUserAccessApi(userScopes: SCOPE_ALLOWED[], url: string, method: MethodEnum): boolean {
    return userScopes.some((scope: any) => {
      const parsedUrl = new URL(url, scope.hostName);
      const path = parsedUrl.pathname;

      if (_.some(whitelistPaths, (whitelistedPath) => path.startsWith(whitelistedPath))) {
        return true;
      }

      const rules = rulesMap[scope.scope];
      return _.some(rules, (rule: any) => {
        const ruleRegex = new RegExp(
          `^${rule.path.replace(/:\w+/g, "([^/]+)")}$`
        );
        return ruleRegex.test(path) && rule.method === method;
      });
    });
  }
}