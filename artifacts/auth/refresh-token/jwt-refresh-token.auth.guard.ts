import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JWTRefreshTokenAuthGuard extends AuthGuard(
  'jwt_refresh_token_strategy',
) {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    // console.log('JWTRefreshTokenAuthGuard handleRequest', user, info);
    if (
      err ||
      !user ||
      !user.userId ||
      !user.token_type ||
      user.token_type !== 'refresh'
    ) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
