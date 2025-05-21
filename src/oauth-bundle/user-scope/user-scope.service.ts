import { BadRequestException, Injectable } from '@nestjs/common';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { Status } from 'src/common/enum/status.enum';
import { ScopeUserDTO } from './dto/scope-user.dto';
import { UserScopeRelationDTO } from './dto/user-scope-relation.dto';
import { UserScopeSearchDTO } from './dto/user-scope-search.dto';
import { UserScopeDTO } from './dto/user-scope.dto';
import {
  UserScopeAssociationRepository,
  VIEW,
} from './repositories/user-scope.repository';

@Injectable()
export class UserScopeService {
  constructor(
    private readonly tcpService: TCPService,
    private readonly userScopeRepository: UserScopeAssociationRepository,
  ) {
    this.tcpService.addTCPMessageHandler('userscopeservice', this);
  }

  async create(
    view: string,
    userScopeDTO: UserScopeDTO,
  ): Promise<UserScopeDTO> {
    const userScope = await this.userScopeRepository
      .include(view)
      .insert(userScopeDTO);

    return new UserScopeDTO(userScope);
  }

  async createUserScopeRelation(
    userScopeRelationDTO: UserScopeRelationDTO,
  ): Promise<UserScopeRelationDTO> {
    const userScopeRelation = await this.userScopeRepository
      .getUserScopeRelationRepository()
      .insert(userScopeRelationDTO);

    return new UserScopeRelationDTO(userScopeRelation);
  }

  async read(view: string, id: string): Promise<any> {
    const userScope = await this.userScopeRepository
      .include(view)
      .where({ id: id }, 'id')
      .findOne();
    if (view === VIEW.USER_SCOPE) {
      return new UserScopeDTO(userScope);
    } else if (view === VIEW.SCOPE_USER) {
      return new ScopeUserDTO(userScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async searchById(view: string, id: string): Promise<any> {
    const userScope = await this.userScopeRepository
      .include(view)
      .and([
        {
          status: {
            [Op.eq]: Status.Enable
          }
        }
      ])
      .where({ id: id }, 'id')
      .findAll();
    if (view === VIEW.USER_SCOPE) {
      return userScope.map((item) => new UserScopeDTO(item));
    } else if (view === VIEW.SCOPE_USER) {
      return userScope.map((item) => new ScopeUserDTO(item));
    }
    throw new BadRequestException('view is not valid');
  }

  async readByAccessKeyId(view: string, accessKeyId: string): Promise<any> {
    const userScope = await this.userScopeRepository
      .include(view)
      .where({ accessKeyId: accessKeyId }, 'accessKeyId')
      .findOne();
    if (view === VIEW.USER_SCOPE) {
      return new UserScopeDTO(userScope);
    } else if (view === VIEW.SCOPE_USER) {
      return new ScopeUserDTO(userScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async readByScope(view: string, scope: string): Promise<any> {
    const userScope = await this.userScopeRepository
      .include(view)
      .where({ scope }, 'scope')
      .findOne();
    if (view === VIEW.USER_SCOPE) {
      return new UserScopeDTO(userScope);
    } else if (view === VIEW.SCOPE_USER || view === VIEW.SCOPE_USER_GATEWAY) {
      return new ScopeUserDTO(userScope);
    }
    throw new BadRequestException('view is not valid');
  }

  async search(
    view: string,
    userScopeSearchDTO: UserScopeSearchDTO,
  ): Promise<ResponseDTO<any[]>> {
    this.userScopeRepository.include(view);

    // pagination option
    this.userScopeRepository.page(
      userScopeSearchDTO.page,
      userScopeSearchDTO.limit,
    );

    // search text option
    if (userScopeSearchDTO.query) {
      this.userScopeRepository.where({
        name: { [Op.iLike]: `%${userScopeSearchDTO.query}%` },
      });
    }
    // filter status option
    if (userScopeSearchDTO.status && userScopeSearchDTO.status !== 'all') {
      this.userScopeRepository.where({
        status: userScopeSearchDTO.status,
      });
    }
    // filter with category id
    if (userScopeSearchDTO.id) {
      this.userScopeRepository.where({
        id: userScopeSearchDTO.id,
      });
    }
    // order by option
    if (userScopeSearchDTO.orderBy) {
      if (userScopeSearchDTO.orderType === 'asc') {
        this.userScopeRepository.order(userScopeSearchDTO.orderBy, 'ASC');
      } else {
        this.userScopeRepository.order(userScopeSearchDTO.orderBy, 'DESC');
      }
    }
    // date range filter option
    if (userScopeSearchDTO.between && userScopeSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[userScopeSearchDTO.between] = {
        [Op.between]: [
          new Date(userScopeSearchDTO.getStartDate()).toUTCString(),
          new Date(userScopeSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.userScopeRepository.where(betweenCondition);
    }

    const userScopeSearchDTOs: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (userScopeSearchDTO.count) {
      const { count, rows } = await this.userScopeRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(userScopeSearchDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        userScopeSearchDTOs,
        await this.userScopeRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(view: string, updateDTO: any): Promise<any> {
    updateDTO.updatedAt = new Date();

    const userScopeUpdated = await this.userScopeRepository.update(updateDTO, {
      where: { id: updateDTO.id },
      returning: true,
    });

    if (view === VIEW.USER_SCOPE) {
      return new UserScopeDTO(userScopeUpdated[1][0]);
    } else if (view === VIEW.SCOPE_USER) {
      return new ScopeUserDTO(userScopeUpdated[1][0]);
    } else {
      return userScopeUpdated;
    }
  }

  async delete(userId: string, scopeId: string): Promise<any> {
    return {
      deleteUserCount: await this.userScopeRepository
        .getuserRepository()
        .where({ id: userId })
        .delete(),
      deleteUserScopeRelationCount: await this.userScopeRepository
        .getUserScopeRelationRepository()
        .where({ userId: userId })
        .delete(),
      deleteScopeMasterCount: await this.userScopeRepository
        .getScopeMasterRepository()
        .where({ id: scopeId })
        .delete(),
    };
  }
}
