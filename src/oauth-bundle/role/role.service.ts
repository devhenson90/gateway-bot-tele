import { Injectable } from '@nestjs/common';
import { RoleRepository } from './repositories/role.repository';
import { RoleDTO } from './dto/role.dto';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { RoleSearchDTO } from './dto/role-search.dto';
import { BaseService } from 'artifacts/api/service';

@Injectable()
export class RoleService extends BaseService<RoleDTO> {
  constructor(private readonly roleRepository: RoleRepository) {
    super(roleRepository)
  }

  async create(roleDTO: RoleDTO): Promise<RoleDTO> {
    const role = await this.roleRepository.insert(roleDTO);
    return new RoleDTO(role);
  }

  async read(id: string): Promise<RoleDTO> {
    const role = await this.roleRepository.where({ id: id }, 'id').findOne();
    return new RoleDTO(role);
  }

  async searchRole(
    roleSearchDTO: RoleSearchDTO,
  ): Promise<ResponseDTO<RoleDTO[]>> {
    this.roleRepository.page(roleSearchDTO.page, roleSearchDTO.limit);

    if (roleSearchDTO.query) {
      this.roleRepository.where({
        name: { [Op.iLike]: `%${roleSearchDTO.query}%` },
      });
    }
    if (roleSearchDTO.status && roleSearchDTO.status !== 'all') {
      this.roleRepository.where({
        status: roleSearchDTO.status,
      });
    }
    if (roleSearchDTO.orderBy) {
      if (roleSearchDTO.orderType === 'asc') {
        this.roleRepository.order(roleSearchDTO.orderBy, 'ASC');
      } else {
        this.roleRepository.order(roleSearchDTO.orderBy, 'DESC');
      }
    }
    if (roleSearchDTO.between && roleSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[roleSearchDTO.between] = {
        [Op.between]: [
          new Date(roleSearchDTO.getStartDate()).toUTCString(),
          new Date(roleSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.roleRepository.where(betweenCondition);
    }

    const roleDTOs: RoleDTO[] = [];
    const responseDTO = new ResponseDTO<RoleDTO[]>();

    if (roleSearchDTO.count) {
      const { count, rows } = await this.roleRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(roleDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        roleDTOs,
        await this.roleRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(updateDTO: RoleDTO): Promise<RoleDTO> {
    updateDTO.updatedAt = new Date();

    const roleUpdated = await this.roleRepository.update(updateDTO, {
      where: { id: updateDTO.id },
      returning: true,
    });

    return new RoleDTO(roleUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.roleRepository.where({ id: id }).delete(),
    };
  }
}
