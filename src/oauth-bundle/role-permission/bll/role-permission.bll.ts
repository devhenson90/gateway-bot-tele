import { Injectable } from '@nestjs/common';
import { RolePermissionService } from '../role-permission.service';

@Injectable()
export class RolePermissionBLL {
  constructor(private readonly rolePermissionService: RolePermissionService) {}
}
