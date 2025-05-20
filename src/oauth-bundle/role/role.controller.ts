import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { RoleDTO } from './dto/role.dto';
import { RoleService } from './role.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/role')
export class RoleController extends BaseController<RoleDTO> {
  constructor(private readonly roleService: RoleService) {
    super(roleService);
  }
}
