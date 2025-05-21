import { Injectable } from '@nestjs/common';
import { ApplicationRepository } from './repositories/application.repository';
import { ApplicationDTO } from './dto/application.dto';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ApplicationSearchDTO } from './dto/application-search.dto';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { BaseService } from 'artifacts/api/service';

@Injectable()
export class ApplicationService extends BaseService<ApplicationDTO> {
  constructor(
    private readonly tcpService: TCPService,
    private readonly applicationRepository: ApplicationRepository,
  ) {
    super(applicationRepository);
    this.tcpService.addTCPMessageHandler('applicationservice', this);
  }

  async create(applicationDTO: ApplicationDTO): Promise<ApplicationDTO> {
    const application = await this.applicationRepository.insert(applicationDTO);
    return new ApplicationDTO(application);
  }

  async read(id: string): Promise<ApplicationDTO> {
    const application = await this.applicationRepository
      .where({ id: id }, 'id')
      .findOne();
    return new ApplicationDTO(application);
  }

  async readByClientId(clientId: string): Promise<any> {
    const application = await this.applicationRepository
      .where({ clientId: clientId }, 'clientId')
      .findOne();
    return new ApplicationDTO(application);
  }

  async searchApplication(
    applicationSearchDTO: ApplicationSearchDTO,
  ): Promise<ResponseDTO<ApplicationDTO[]>> {
    this.applicationRepository.page(
      applicationSearchDTO.page,
      applicationSearchDTO.limit,
    );

    if (applicationSearchDTO.query) {
      this.applicationRepository.where({
        name: { [Op.iLike]: `%${applicationSearchDTO.query}%` },
      });
    }
    if (applicationSearchDTO.status && applicationSearchDTO.status !== 'all') {
      this.applicationRepository.where({
        status: applicationSearchDTO.status,
      });
    }
    if (applicationSearchDTO.orderBy) {
      if (applicationSearchDTO.orderType === 'asc') {
        this.applicationRepository.order(applicationSearchDTO.orderBy, 'ASC');
      } else {
        this.applicationRepository.order(applicationSearchDTO.orderBy, 'DESC');
      }
    }
    if (applicationSearchDTO.between && applicationSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[applicationSearchDTO.between] = {
        [Op.between]: [
          new Date(applicationSearchDTO.getStartDate()).toUTCString(),
          new Date(applicationSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.applicationRepository.where(betweenCondition);
    }

    const applicationDTOs: ApplicationDTO[] = [];
    const responseDTO = new ResponseDTO<ApplicationDTO[]>();

    if (applicationSearchDTO.count) {
      const { count, rows } = await this.applicationRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(applicationDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        applicationDTOs,
        await this.applicationRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(updateDTO: ApplicationDTO): Promise<ApplicationDTO> {
    updateDTO.updatedAt = new Date();

    const applicationUpdated = await this.applicationRepository.update(
      updateDTO,
      {
        where: { id: updateDTO.id },
        returning: true,
      },
    );

    return new ApplicationDTO(applicationUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.applicationRepository.where({ id: id }).delete(),
    };
  }
}
