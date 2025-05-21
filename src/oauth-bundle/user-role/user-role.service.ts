import { Injectable } from '@nestjs/common';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { BaseService } from 'artifacts/api/service';
import { UserRoleDTO } from './dto/user-role.dto';
import { UserRoleSearchDTO } from './dto/user-role-search.dto';
import { AssociationBaseService } from 'artifacts/api/association.service';
import { UserRoleRepository } from './repositories/user-role.repository';

@Injectable()
export class UserRoleService extends AssociationBaseService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {
    super(userRoleRepository)
  }
}
