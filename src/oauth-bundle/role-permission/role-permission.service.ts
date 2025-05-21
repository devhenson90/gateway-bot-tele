import { BadRequestException, Injectable } from '@nestjs/common';
import {
  VIEW,
  RolePermissionAssociationRepository,
} from './repositories/role-permission.repository';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { RolePermissionDTO } from './dto/role-permission.dto';
import { RolePermissionSearchDTO } from './dto/role-permission-search.dto';
import { PermissionRoleDTO } from './dto/permission-role.dto';
import { RolePermissionRelationDTO } from './dto/role-permission-relation.dto';

@Injectable()
export class RolePermissionService {
  constructor(
    private readonly rolePermissionRepository: RolePermissionAssociationRepository,
  ) {}

  async create(
    view: string,
    rolePermissionDTO: RolePermissionDTO,
  ): Promise<RolePermissionDTO> {
    const rolePermission = await this.rolePermissionRepository
      .include(view)
      .insert(rolePermissionDTO);

    return new RolePermissionDTO(rolePermission);
  }

  async createRolePermissionRelation(
    rolePermissionRelationDTO: RolePermissionRelationDTO,
  ): Promise<RolePermissionRelationDTO> {
    const rolePermissionRelation = await this.rolePermissionRepository
      .getRolePermissionRelationRepository()
      .insert(rolePermissionRelationDTO);

    return new RolePermissionRelationDTO(rolePermissionRelation);
  }

  async read(view: string, id: string): Promise<any> {
    const rolePermission = await this.rolePermissionRepository
      .include(view)
      .where({ id: id }, 'id')
      .findOne();
    if (view === VIEW.ROLE_PERMISSION) {
      return new RolePermissionDTO(rolePermission);
    } else if (view === VIEW.PERMISSION_ROLE) {
      return new PermissionRoleDTO(rolePermission);
    }
    throw new BadRequestException('view is not valid');
  }

  async search(
    view: string,
    rolePermissionSearchDTO: RolePermissionSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    this.rolePermissionRepository.include(view);

    // pagination option
    this.rolePermissionRepository.page(
      rolePermissionSearchDTO.page,
      rolePermissionSearchDTO.limit,
    );

    // search text option
    if (rolePermissionSearchDTO.query) {
      this.rolePermissionRepository.where({
        name: { [Op.iLike]: `%${rolePermissionSearchDTO.query}%` },
      });
    }
    // filter status option
    if (
      rolePermissionSearchDTO.status &&
      rolePermissionSearchDTO.status !== 'all'
    ) {
      this.rolePermissionRepository.where({
        status: rolePermissionSearchDTO.status,
      });
    }
    // filter with role permission id
    if (rolePermissionSearchDTO.id) {
      this.rolePermissionRepository.where({
        id: rolePermissionSearchDTO.id,
      });
    }
    // order by option
    if (rolePermissionSearchDTO.orderBy) {
      if (rolePermissionSearchDTO.orderType === 'asc') {
        this.rolePermissionRepository.order(
          rolePermissionSearchDTO.orderBy,
          'ASC',
        );
      } else {
        this.rolePermissionRepository.order(
          rolePermissionSearchDTO.orderBy,
          'DESC',
        );
      }
    }
    // date range filter option
    if (
      rolePermissionSearchDTO.between &&
      rolePermissionSearchDTO.betweenDate
    ) {
      const betweenCondition = {};
      betweenCondition[rolePermissionSearchDTO.between] = {
        [Op.between]: [
          new Date(rolePermissionSearchDTO.getStartDate()).toUTCString(),
          new Date(rolePermissionSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.rolePermissionRepository.where(betweenCondition);
    }

    const rolePermissionSearchDTOs: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (rolePermissionSearchDTO.count) {
      const { count, rows } =
        await this.rolePermissionRepository.findAndCountAll({
          distinct: true,
        });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(rolePermissionSearchDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        rolePermissionSearchDTOs,
        await this.rolePermissionRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(view: string, updateDTO: any): Promise<any> {
    updateDTO.updatedAt = new Date();

    const rolePermissionUpdated = await this.rolePermissionRepository.update(
      updateDTO,
      {
        where: { id: updateDTO.id },
        returning: true,
      },
    );

    if (view === VIEW.ROLE_PERMISSION) {
      return new RolePermissionDTO(rolePermissionUpdated[1][0]);
    } else if (view === VIEW.PERMISSION_ROLE) {
      return new PermissionRoleDTO(rolePermissionUpdated[1][0]);
    } else {
      return rolePermissionUpdated;
    }
  }

  async delete(roleId: string, permissionId: string): Promise<any> {
    return {
      deleteRoleCount: await this.rolePermissionRepository
        .getRoleRepository()
        .where({ id: roleId })
        .delete(),
      deleteRolePermissionRelationCount: await this.rolePermissionRepository
        .getRolePermissionRelationRepository()
        .where({ roleId: roleId })
        .delete(),
      deletePermissionCount: await this.rolePermissionRepository
        .getPermissionRepository()
        .where({ id: permissionId })
        .delete(),
    };
  }
}
