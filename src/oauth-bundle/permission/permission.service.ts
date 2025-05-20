import { Injectable } from '@nestjs/common';
import { PermissionRepository } from './repositories/permission.repository';
import { PermissionDTO } from './dto/permission.dto';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { PermissionSearchDTO } from './dto/permission-search.dto';
import { BaseService } from 'artifacts/api/service';

@Injectable()
export class PermissionService extends BaseService<PermissionDTO> {
  constructor(private readonly permissionRepository: PermissionRepository) {
    super(permissionRepository)
  }

  async create(permissionDTO: PermissionDTO): Promise<PermissionDTO> {
    const permission = await this.permissionRepository.insert(permissionDTO);
    return new PermissionDTO(permission);
  }

  async read(id: string): Promise<PermissionDTO> {
    const permission = await this.permissionRepository
      .where({ id: id }, 'id')
      .findOne();
    return new PermissionDTO(permission);
  }

  async searchPermission(
    permissionSearchDTO: PermissionSearchDTO,
  ): Promise<ResponseDTO<PermissionDTO[]>> {
    this.permissionRepository.page(
      permissionSearchDTO.page,
      permissionSearchDTO.limit,
    );

    if (permissionSearchDTO.query) {
      this.permissionRepository.where({
        name: { [Op.iLike]: `%${permissionSearchDTO.query}%` },
      });
    }
    if (permissionSearchDTO.status && permissionSearchDTO.status !== 'all') {
      this.permissionRepository.where({
        status: permissionSearchDTO.status,
      });
    }
    if (permissionSearchDTO.orderBy) {
      if (permissionSearchDTO.orderType === 'asc') {
        this.permissionRepository.order(permissionSearchDTO.orderBy, 'ASC');
      } else {
        this.permissionRepository.order(permissionSearchDTO.orderBy, 'DESC');
      }
    }
    if (permissionSearchDTO.between && permissionSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[permissionSearchDTO.between] = {
        [Op.between]: [
          new Date(permissionSearchDTO.getStartDate()).toUTCString(),
          new Date(permissionSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.permissionRepository.where(betweenCondition);
    }

    const permissionDTOs: PermissionDTO[] = [];
    const responseDTO = new ResponseDTO<PermissionDTO[]>();

    if (permissionSearchDTO.count) {
      const { count, rows } = await this.permissionRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(permissionDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        permissionDTOs,
        await this.permissionRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(updateDTO: PermissionDTO): Promise<PermissionDTO> {
    updateDTO.updatedAt = new Date();

    const permissionUpdated = await this.permissionRepository.update(
      updateDTO,
      {
        where: { id: updateDTO.id },
        returning: true,
      },
    );

    return new PermissionDTO(permissionUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.permissionRepository.where({ id: id }).delete(),
    };
  }
}
