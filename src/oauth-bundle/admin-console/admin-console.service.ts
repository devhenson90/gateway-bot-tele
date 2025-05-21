import { Injectable } from '@nestjs/common';
import { BaseService } from 'artifacts/api/service';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { SearchDTO } from 'src/common/dto/search.dto';
import { Status } from '../role/enum/status.enum';
import { UserBLL } from '../user/bll/user.bll';
import { AdminConsoleDTO } from './dto/admin-console.dto';
import { AdminConsoleRepository } from './repositories/admin-console.repository';

export const AdminConsoleExcludeAttributes = ['password'];

@Injectable()
export class AdminConsoleService extends BaseService<AdminConsoleDTO> {
  constructor(
    private readonly adminConsoleRepository: AdminConsoleRepository,
    private readonly userBLL: UserBLL,
  ) {
    super(adminConsoleRepository);
  }

  search(
    searchDTO: SearchDTO,
    attrs?: any,
  ): Promise<ResponseDTO<AdminConsoleDTO[]>> {
    if (!attrs) {
      attrs = {};
    }
    attrs.attributes = { exclude: AdminConsoleExcludeAttributes };
    return super.search(searchDTO, attrs);
  }

  async findOne(attrs: any): Promise<AdminConsoleDTO> {
    const data = await this.adminConsoleRepository.findOne(attrs);
    return this.newEntity(data);
  }

  async read(id: string): Promise<AdminConsoleDTO> {
    return this.findOne({
      attributes: { exclude: AdminConsoleExcludeAttributes },
      where: {
        id,
      },
    });
  }

  async create(dto: AdminConsoleDTO): Promise<AdminConsoleDTO> {
    if (dto.password) {
      dto.password = await this.userBLL.encryptPassword(dto.password);
    }
    dto.status = Status.Enable;
    const data = await this.adminConsoleRepository.insert(dto);
    return this.newEntity(data);
  }

  async stampLoginEvent(userId: number): Promise<void> {
    try {
      const toUpdate = {
        lastLoginAt: new Date(),
      };
      await this.adminConsoleRepository.update(toUpdate, {
        where: {
          id: Number(userId),
        },
      });
    } catch (err) {
      console.error(err, err.stack, AdminConsoleService.name);
    }
  }

  async stampLastActiveEvent(userId: number): Promise<void> {
    try {
      const toUpdate = {
        lastActiveAt: new Date(),
      };
      await this.adminConsoleRepository.update(toUpdate, {
        where: {
          id: Number(userId),
        },
      });
    } catch (err) {
      console.error(err, err.stack, AdminConsoleService.name);
    }
  }
}
