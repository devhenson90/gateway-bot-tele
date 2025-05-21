import { Injectable } from '@nestjs/common';
import { BaseService } from 'artifacts/api/service';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Status } from '../role/enum/status.enum';
import { ScopeMasterSearchDTO } from './dto/scope-master-search.dto';
import { ScopeMasterDTO } from './dto/scope-master.dto';
import { ScopeMasterRepository } from './repositories/scope-master.repository';

@Injectable()
export class ScopeMasterService extends BaseService<ScopeMasterDTO> {
  constructor(
    private readonly tcpService: TCPService,
    private readonly scopeMasterRepository: ScopeMasterRepository,
  ) {
    super(scopeMasterRepository);
    this.tcpService.addTCPMessageHandler('scopemasterservice', this);
  }

  async create(scopeMasterDTO: ScopeMasterDTO): Promise<ScopeMasterDTO> {
    const scopeMaster = await this.scopeMasterRepository.insert(scopeMasterDTO);
    return new ScopeMasterDTO(scopeMaster);
  }

  async read(id: string): Promise<ScopeMasterDTO> {
    const scopeMaster = await this.scopeMasterRepository
      .where({ id: id }, 'id')
      .findOne();
    return new ScopeMasterDTO(scopeMaster);
  }

  async readByScope(scope: string): Promise<ScopeMasterDTO> {
    const scopeMaster = await this.scopeMasterRepository
      .where({ scope: scope }, 'scope')
      .findOne();
    return new ScopeMasterDTO(scopeMaster);
  }

  async searchScopeMaster(
    scopeMasterSearchDTO: ScopeMasterSearchDTO,
  ): Promise<ResponseDTO<ScopeMasterDTO[]>> {
    this.scopeMasterRepository.page(
      scopeMasterSearchDTO.page,
      scopeMasterSearchDTO.limit,
    );

    if (scopeMasterSearchDTO.adminConsoleId) {
      this.scopeMasterRepository.where({
        adminConsoleId: scopeMasterSearchDTO.adminConsoleId,
      })
    }

    if (scopeMasterSearchDTO.query) {
      this.scopeMasterRepository.where({
        name: { [Op.iLike]: `%${scopeMasterSearchDTO.query}%` },
      });
    }
    if (scopeMasterSearchDTO.status && scopeMasterSearchDTO.status !== 'all') {
      this.scopeMasterRepository.where({
        status: {
          [Op.and]: [scopeMasterSearchDTO.status, { [Op.ne]: Status.Delete }],
        },
      });
    } else {
      this.scopeMasterRepository.where({
        status: { [Op.ne]: Status.Delete },
      })
    }
    if (scopeMasterSearchDTO.orderBy) {
      if (scopeMasterSearchDTO.orderType === 'asc') {
        this.scopeMasterRepository.order(scopeMasterSearchDTO.orderBy, 'ASC');
      } else {
        this.scopeMasterRepository.order(scopeMasterSearchDTO.orderBy, 'DESC');
      }
    }
    if (scopeMasterSearchDTO.between && scopeMasterSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[scopeMasterSearchDTO.between] = {
        [Op.between]: [
          new Date(scopeMasterSearchDTO.getStartDate()).toUTCString(),
          new Date(scopeMasterSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.scopeMasterRepository.where(betweenCondition);
    }

    const scopeMasterDTOs: ScopeMasterDTO[] = [];
    const responseDTO = new ResponseDTO<ScopeMasterDTO[]>();

    if (scopeMasterSearchDTO.count) {
      const { count, rows } = await this.scopeMasterRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(scopeMasterDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        scopeMasterDTOs,
        await this.scopeMasterRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(updateDTO: ScopeMasterDTO): Promise<ScopeMasterDTO> {
    updateDTO.updatedAt = new Date();

    const scopeMasterUpdated = await this.scopeMasterRepository.update(
      updateDTO,
      {
        where: { id: updateDTO.id },
        returning: true,
      },
    );

    return new ScopeMasterDTO(scopeMasterUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.scopeMasterRepository.where({ id: id }).delete(),
    };
  }
}
