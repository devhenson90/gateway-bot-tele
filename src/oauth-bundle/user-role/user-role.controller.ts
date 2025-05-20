import { Controller, UseGuards } from '@nestjs/common';
import { AssociationController } from 'artifacts/api/association.controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { UserRoleService } from './user-role.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/user-role')
export class UserRoleController extends AssociationController {
  constructor(private readonly userRoleService: UserRoleService) {
    super(userRoleService);
  }
}
