import { Controller, UseGuards } from '@nestjs/common';
import { BaseController } from 'artifacts/api/controller';
import { PublicSignatureAuthGuard } from 'artifacts/auth/public-signature/public-signature.auth.guard';
import { PermissionDTO } from './dto/permission.dto';
import { PermissionService } from './permission.service';

@UseGuards(PublicSignatureAuthGuard)
@Controller('/v1/permission')
export class PermissionController extends BaseController<PermissionDTO> {
  constructor(private readonly permissionService: PermissionService) {
    super(permissionService);
  }
}
