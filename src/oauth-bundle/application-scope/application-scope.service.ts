import { BadRequestException, Injectable } from '@nestjs/common';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ApplicationScopeRelationDTO } from './dto/application-scope-relation.dto';
import { ApplicationScopeSearchDTO } from './dto/application-scope-search.dto';
import { ApplicationScopeDTO } from './dto/application-scope.dto';
import { ScopeApplicationDTO } from './dto/scope-application.dto';
import {
  ApplicationScopeAssociationRepository,
  VIEW,
} from './repositories/application-scope.repository';

@Injectable()
export class ApplicationScopeService {
  constructor(
    private readonly tcpService: TCPService,
    private readonly applicationScopeRepository: ApplicationScopeAssociationRepository,
  ) {
    this.tcpService.addTCPMessageHandler('applicationscopeservice', this);
  }

  async create(
    view: string,
    applicationScopeDTO: ApplicationScopeDTO,
  ): Promise<ApplicationScopeDTO> {
    const applicationScope = await this.applicationScopeRepository
      .include(view)
      .insert(applicationScopeDTO);

    return new ApplicationScopeDTO(applicationScope);
  }

  async createApplicationScopeRelation(
    applicationScopeRelationDTO: ApplicationScopeRelationDTO,
  ): Promise<ApplicationScopeRelationDTO> {
    const applicationScopeRelation = await this.applicationScopeRepository
      .getApplicationScopeRelationRepository()
      .insert(applicationScopeRelationDTO);

    return new ApplicationScopeRelationDTO(applicationScopeRelation);
  }

  async read(view: string, id: string): Promise<any> {
    const applicationScope = await this.applicationScopeRepository
      .include(view)
      .where({ id: id }, 'id')
      .findOne();
    if (view === VIEW.APPLICATION_SCOPE) {
      return new ApplicationScopeDTO(applicationScope);
    } else if (view === VIEW.SCOPE_APPLICATION) {
      return new ScopeApplicationDTO(applicationScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async readByClientId(view: string, clientId: string): Promise<any> {
    const applicationScope = await this.applicationScopeRepository
      .include(view)
      .where({ clientId: clientId }, 'clientId')
      .findOne();
    if (view === VIEW.APPLICATION_SCOPE) {
      return new ApplicationScopeDTO(applicationScope);
    } else if (view === VIEW.SCOPE_APPLICATION) {
      return new ScopeApplicationDTO(applicationScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async searchByClientId(view: string, clientId: string[]): Promise<any> {
    const applicationScope = await this.applicationScopeRepository
      .include(view)
      .where({ clientId: { [Op.in]: clientId } }, 'clientId')
      .findAll();
    if (view === VIEW.APPLICATION_SCOPE) {
      return applicationScope.map((item) => new ApplicationScopeDTO(item));
    } else if (view === VIEW.SCOPE_APPLICATION) {
      return applicationScope.map((item) => new ScopeApplicationDTO(item));
    }
    throw new BadRequestException('view is not valid');
  }

  async readByClientIdSecret(
    view: string,
    clientId: string,
    clientSecret: string,
  ): Promise<any> {
    const applicationScope = await this.applicationScopeRepository
      .include(view)
      .where({ clientId: clientId, clientSecret: clientSecret })
      .findOne();
    if (view === VIEW.APPLICATION_SCOPE) {
      return new ApplicationScopeDTO(applicationScope);
    } else if (view === VIEW.SCOPE_APPLICATION) {
      return new ScopeApplicationDTO(applicationScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async search(
    view: string,
    applicationScopeSearchDTO: ApplicationScopeSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    this.applicationScopeRepository.include(view);

    // pagination option
    this.applicationScopeRepository.page(
      applicationScopeSearchDTO.page,
      applicationScopeSearchDTO.limit,
    );

    // search text option
    if (applicationScopeSearchDTO.query) {
      this.applicationScopeRepository.where({
        name: { [Op.iLike]: `%${applicationScopeSearchDTO.query}%` },
      });
    }
    // filter status option
    if (
      applicationScopeSearchDTO.status &&
      applicationScopeSearchDTO.status !== 'all'
    ) {
      this.applicationScopeRepository.where({
        status: applicationScopeSearchDTO.status,
      });
    }
    // filter with category id
    if (applicationScopeSearchDTO.id) {
      this.applicationScopeRepository.where({
        id: applicationScopeSearchDTO.id,
      });
    }
    // order by option
    if (applicationScopeSearchDTO.orderBy) {
      if (applicationScopeSearchDTO.orderType === 'asc') {
        this.applicationScopeRepository.order(
          applicationScopeSearchDTO.orderBy,
          'ASC',
        );
      } else {
        this.applicationScopeRepository.order(
          applicationScopeSearchDTO.orderBy,
          'DESC',
        );
      }
    }
    // date range filter option
    if (
      applicationScopeSearchDTO.between &&
      applicationScopeSearchDTO.betweenDate
    ) {
      const betweenCondition = {};
      betweenCondition[applicationScopeSearchDTO.between] = {
        [Op.between]: [
          new Date(applicationScopeSearchDTO.getStartDate()).toUTCString(),
          new Date(applicationScopeSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.applicationScopeRepository.where(betweenCondition);
    }

    const applicationScopeSearchDTOs: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (applicationScopeSearchDTO.count) {
      const { count, rows } =
        await this.applicationScopeRepository.findAndCountAll({
          distinct: true,
        });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(applicationScopeSearchDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        applicationScopeSearchDTOs,
        await this.applicationScopeRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(view: string, updateDTO: any): Promise<any> {
    updateDTO.updatedAt = new Date();

    const applicationScopeUpdated =
      await this.applicationScopeRepository.update(updateDTO, {
        where: { id: updateDTO.id },
        returning: true,
      });

    if (view === VIEW.APPLICATION_SCOPE) {
      return new ApplicationScopeDTO(applicationScopeUpdated[1][0]);
    } else if (view === VIEW.SCOPE_APPLICATION) {
      return new ScopeApplicationDTO(applicationScopeUpdated[1][0]);
    } else {
      return applicationScopeUpdated;
    }
  }

  async delete(applicationId: string, scopeId: string): Promise<any> {
    return {
      deleteApplicationCount: await this.applicationScopeRepository
        .getApplicationRepository()
        .where({ id: applicationId })
        .delete(),
      deleteApplicationScopeRelationCount: await this.applicationScopeRepository
        .getApplicationScopeRelationRepository()
        .where({ applicationId: applicationId })
        .delete(),
      deleteScopeMasterCount: await this.applicationScopeRepository
        .getScopeMasterRepository()
        .where({ id: scopeId })
        .delete(),
    };
  }
}
