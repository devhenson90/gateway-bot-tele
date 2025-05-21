import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/oauth-bundle/user/user.service';

@Injectable()
export class Jwt2faAuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const user = await this.userService.readByUserEmail(request.user.username);

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.isFirstLogin) {
      throw new BadRequestException('FIRST_LOGIN');
    }

    if (user.isMfaEnabled) {
      throw new BadRequestException('REGENERATE_2FA');
    }

    return true;
  }
}
