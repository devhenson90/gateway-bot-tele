import { Injectable } from '@nestjs/common';
import { UserScopeService } from '../user-scope.service';

@Injectable()
export class UserScopeBLL {
  constructor(private readonly userScopeService: UserScopeService) {}
}
