import { Injectable } from '@nestjs/common';
import { AssociationBaseService } from 'artifacts/api/association.service';
import { SCOPE_ALLOWED } from 'artifacts/auth/rules/enums';
import { DayJsService } from 'artifacts/day-js/day-js.service';
import * as _ from 'lodash';
import { Op, Sequelize } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { RDSHelperService } from 'src/global/rds-helper.service';
import { Status } from '../role/enum/status.enum';
import { UserBLL } from '../user/bll/user.bll';
import { UserAssoSearchDTO } from './dto/user-asso-search.dto';
import { UserAssoRepository, VIEW } from './repositories/user-asso.repository';

@Injectable()
export class UserAssoService extends AssociationBaseService {
  constructor(
    private readonly userAssoRepository: UserAssoRepository,
    private readonly userBLL: UserBLL,
    private readonly dayJsService: DayJsService,
    private readonly rdsHelperService: RDSHelperService,
  ) {
    super(userAssoRepository)
  }

  async search(view: string, searchDTO: UserAssoSearchDTO) {
    const result = await super.search(view, searchDTO, {
      where: {
        status: {
          [Op.ne]: Status.Delete
        },
        // adminConsoleId: searchDTO.adminConsoleId ? searchDTO.adminConsoleId : { [Op.ne]: null },
      },
      distinct: true
    });

    result.data = result.data.map((u) => {
      const user = this.newEntity(u);
      user.phone = this.userBLL.decryptAES(user.phone);
      return user;
    });

    return result;
  }

  async searchWithRoles(view: string, searchDTO: UserAssoSearchDTO) {
    let attr = null;


    this.userAssoRepository.include(view);

    if (!!searchDTO.query && searchDTO.query !== '') {
      this.userAssoRepository.or([
        {
          username: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        },
        {
          email: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        }
      ]);
    }

    this.userAssoRepository.where({
      status: {
        [Op.ne]: Status.Delete
      },
    });

    if (!!searchDTO.type && searchDTO.type !== '') {
      this.userAssoRepository.where({
        '$"roles"."type"$': {
          [Op.in]: searchDTO.type.split(',')
        },
      });
    }

    if (!!searchDTO.roles && searchDTO.roles !== '') {
      this.userAssoRepository.where({
        '$"roles"."name"$': {
          [Op.in]: searchDTO.roles.split(',')
        },
      });
    }

    if (!!searchDTO.scope && searchDTO.scope !== '') {
      this.userAssoRepository.where({
        '$"scopes"."scope"$': {
          [Op.in]: searchDTO.scope.split(',')
        },
      });
    }

    if (!searchDTO.ignorePage) {
      this.userAssoRepository.page(searchDTO.page, searchDTO.limit);
    }

    const orderOption = [];
    if (searchDTO.orderBy && searchDTO.orderBy != '') {
      if (searchDTO.orderType === 'asc') {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'ASC']);
      } else {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'DESC']);
      }
    }

    if (searchDTO.between && searchDTO.betweenDate) {
      const betweenCreatedStart = searchDTO.betweenDate.split(',')[0];
      const betweenCreatedEnd =
        searchDTO.betweenDate.split(',')[1] ?? new Date().toISOString();
      const betweenCondition = {};
      betweenCondition[searchDTO.between] = {
        [Op.between]: [
          betweenCreatedStart.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedStart)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedStart)
                .tz('Asia/Bangkok')
                .startOf('day')
                .toISOString(),
          betweenCreatedEnd.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedEnd)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedEnd)
                .tz('Asia/Bangkok')
                .endOf('day')
                .toISOString(),
        ],
      };
      this.userAssoRepository.where(betweenCondition);
    }
    const dtos: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (searchDTO.count) {
      const { count, rows } = await this.userAssoRepository.findAndCountAll({
        distinct: true,
        subQuery: false,
        order: orderOption,
        joinFiltering: true,
        attributes: attr
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(dtos, rows);
    } else {
      responseDTO.data = Object.assign(
        dtos,
        await this.userAssoRepository.findAll({
          subQuery: false,
          order: orderOption,
          joinFiltering: true,
          attributes: attr
        }),
      );
    }

    responseDTO.data = responseDTO.data.map((u) => {
      const user = this.newEntity(u);
      user.phone = this.userBLL.decryptAES(user.phone);
      return user;
    });

    return responseDTO;
  }

  async searchWithRolesUserId(view: string, searchDTO: UserAssoSearchDTO, id: string) {
    let attr = null;

    this.userAssoRepository.include(view);

    if (!!searchDTO.query && searchDTO.query !== '') {
      this.userAssoRepository.or([
        {
          username: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        },
        {
          email: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        }
      ]);
    }

    this.userAssoRepository.where({
      id: id
    });

    this.userAssoRepository.where({
      status: {
        [Op.ne]: Status.Delete
      },
    });

    if (!!searchDTO.type && searchDTO.type !== '') {
      this.userAssoRepository.where({
        '$"roles"."type"$': {
          [Op.in]: searchDTO.type.split(',')
        },
      });
    }

    if (!!searchDTO.roles && searchDTO.roles !== '') {
      this.userAssoRepository.where({
        '$"roles"."name"$': {
          [Op.in]: searchDTO.roles.split(',')
        },
      });
    }

    if (!!searchDTO.scope && searchDTO.scope !== '') {
      this.userAssoRepository.where({
        '$"scopes"."scope"$': {
          [Op.in]: searchDTO.scope.split(',')
        },
      });
    }

    if (!searchDTO.ignorePage) {
      this.userAssoRepository.page(searchDTO.page, searchDTO.limit);
    }

    const orderOption = [];
    if (searchDTO.orderBy && searchDTO.orderBy != '') {
      if (searchDTO.orderType === 'asc') {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'ASC']);
      } else {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'DESC']);
      }
    }

    if (searchDTO.between && searchDTO.betweenDate) {
      const betweenCreatedStart = searchDTO.betweenDate.split(',')[0];
      const betweenCreatedEnd =
        searchDTO.betweenDate.split(',')[1] ?? new Date().toISOString();
      const betweenCondition = {};
      betweenCondition[searchDTO.between] = {
        [Op.between]: [
          betweenCreatedStart.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedStart)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedStart)
                .tz('Asia/Bangkok')
                .startOf('day')
                .toISOString(),
          betweenCreatedEnd.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedEnd)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedEnd)
                .tz('Asia/Bangkok')
                .endOf('day')
                .toISOString(),
        ],
      };
      this.userAssoRepository.where(betweenCondition);
    }
    const dtos: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (searchDTO.count) {
      const { count, rows } = await this.userAssoRepository.findAndCountAll({
        distinct: true,
        subQuery: false,
        order: orderOption,
        joinFiltering: true,
        attributes: attr
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(dtos, rows);
    } else {
      responseDTO.data = Object.assign(
        dtos,
        await this.userAssoRepository.findAll({
          subQuery: false,
          order: orderOption,
          joinFiltering: true,
          attributes: attr
        }),
      );
    }

    responseDTO.data = responseDTO.data.map((u) => {
      const user = this.newEntity(u);
      user.phone = this.userBLL.decryptAES(user.phone);
      return user;
    });

    return responseDTO;
  }

  async searchByRoles(view: string, searchDTO: UserAssoSearchDTO) {
    this.userAssoRepository.include(view);

    if (!!searchDTO.query && searchDTO.query !== '') {
      this.userAssoRepository.or([
        {
          username: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        },
        {
          email: {
            [Op.iLike]: `%${searchDTO.query}%`
          }
        }
      ]);
    }

    this.userAssoRepository.where({
      status: {
        [Op.eq]: Status.Enable
      },
    });

    if (!!searchDTO.type && searchDTO.type !== '') {
      this.userAssoRepository.where({
        '$"roles"."type"$': {
          [Op.in]: searchDTO.type.split(',')
        },
      });
    }

    if (!!searchDTO.roles && searchDTO.roles !== '') {
      this.userAssoRepository.where({
        '$"roles"."name"$': {
          [Op.in]: searchDTO.roles.split(',')
        },
      });
    }

    if (!!searchDTO.scope && searchDTO.scope !== '') {
      this.userAssoRepository.where({
        '$"scopes"."scope"$': {
          [Op.in]: searchDTO.scope.split(',')
        },
      });
    }

    if (!searchDTO.ignorePage) {
      this.userAssoRepository.page(searchDTO.page, searchDTO.limit);
    }

    const orderOption = [];
    if (searchDTO.orderBy && searchDTO.orderBy != '') {
      if (searchDTO.orderType === 'asc') {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'ASC']);
      } else {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'DESC']);
      }
    }

    if (searchDTO.between && searchDTO.betweenDate) {
      const betweenCreatedStart = searchDTO.betweenDate.split(',')[0];
      const betweenCreatedEnd =
        searchDTO.betweenDate.split(',')[1] ?? new Date().toISOString();
      const betweenCondition = {};
      betweenCondition[searchDTO.between] = {
        [Op.between]: [
          betweenCreatedStart.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedStart)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedStart)
                .tz('Asia/Bangkok')
                .startOf('day')
                .toISOString(),
          betweenCreatedEnd.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedEnd)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedEnd)
                .tz('Asia/Bangkok')
                .endOf('day')
                .toISOString(),
        ],
      };
      this.userAssoRepository.where(betweenCondition);
    }
    const dtos: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (searchDTO.count) {
      const { count, rows } = await this.userAssoRepository.findAndCountAll({
        distinct: true,
        subQuery: false,
        order: orderOption,
        joinFiltering: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(dtos, rows);
    } else {
      responseDTO.data = Object.assign(
        dtos,
        await this.userAssoRepository.findAll({
          subQuery: false,
          order: orderOption,
          joinFiltering: true,
        }),
      );
    }

    responseDTO.data = responseDTO.data.map((u) => {
      const user = this.newEntity(u);
      user.phone = this.userBLL.decryptAES(user.phone);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((r: any) => r.name),
      };
    });

    return responseDTO;
  }

  async readView(view: string, id: string, adminConsoleId: number): Promise<any> {
    const data = await this.userAssoRepository
      .include(view)
      .where({
        id: id,
        status: {
          [Op.ne]: Status.Delete
        },
        // adminConsoleId: adminConsoleId ? adminConsoleId : { [Op.ne]: null },
      })
      .findOne();

    const user = this.newEntity(data);
    user.phone = this.userBLL.decryptAES(user.phone);
    return user;
  }

  async readRolePermission(view: string, id: string): Promise<any> {
    const data = await this.userAssoRepository
      .include(view)
      .where({
        id: id,
        status: {
          [Op.ne]: Status.Delete
        },
      })
      .findOne({
        attributes: ['username']
      });

    const user = this.newEntity(data);
    return user;
  }

  async searchAllUsers(view: string, searchDTO: UserAssoSearchDTO) {
    const user = await this.readView(VIEW.USER_APPLICATION, searchDTO.adminConsoleId.toString(), 0);

    if (_.isEmpty(user)) {
      throw new Error('User not found');
    }

    const applicationIds = _.map(user.applications, 'id');

    let attr = null;

    if (view === VIEW.USER_ALL) {
      attr = ['id', 'username', 'email', 'phone', 'status']
    }

    this.userAssoRepository.include(view);

    this.userAssoRepository.where({
      status: {
        [Op.ne]: Status.Delete
      },
    });

    this.userAssoRepository.where({
      '$"scopes"."scope"$': {
        [Op.in]: [SCOPE_ALLOWED.MERCHANT_SERVICE, SCOPE_ALLOWED.AGENT_SERVICE]
      },
    });

    this.userAssoRepository.where({
      '$"applications"."id"$': {
        [Op.in]: applicationIds
      }
    })

    if (!searchDTO.ignorePage) {
      this.userAssoRepository.page(searchDTO.page, searchDTO.limit);
    }

    const orderOption = [];
    if (searchDTO.orderBy && searchDTO.orderBy != '') {
      if (searchDTO.orderType === 'asc') {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'ASC']);
      } else {
        orderOption.push([Sequelize.literal(this.rdsHelperService.columnIdentifier(searchDTO.orderBy)), 'DESC']);
      }
    }

    if (searchDTO.between && searchDTO.betweenDate) {
      const betweenCreatedStart = searchDTO.betweenDate.split(',')[0];
      const betweenCreatedEnd =
        searchDTO.betweenDate.split(',')[1] ?? new Date().toISOString();
      const betweenCondition = {};
      betweenCondition[searchDTO.between] = {
        [Op.between]: [
          betweenCreatedStart.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedStart)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedStart)
                .tz('Asia/Bangkok')
                .startOf('day')
                .toISOString(),
          betweenCreatedEnd.includes(':') ?
            this.dayJsService
              .dayjs(betweenCreatedEnd)
              .tz('Asia/Bangkok')
              .toISOString() : this.dayJsService
                .dayjs(betweenCreatedEnd)
                .tz('Asia/Bangkok')
                .endOf('day')
                .toISOString(),
        ],
      };
      this.userAssoRepository.where(betweenCondition);
    }
    const dtos: any[] = [];
    const responseDTO = new ResponseDTO<any[]>();

    if (searchDTO.count) {
      const { count, rows } = await this.userAssoRepository.findAndCountAll({
        distinct: true,
        subQuery: false,
        order: orderOption,
        joinFiltering: true,
        attributes: attr
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(dtos, rows);
    } else {
      responseDTO.data = Object.assign(
        dtos,
        await this.userAssoRepository.findAll({
          subQuery: false,
          order: orderOption,
          joinFiltering: true,
          attributes: attr
        }),
      );
    }

    responseDTO.data = responseDTO.data.map((u) => {
      const user = this.newEntity(u);
      user.phone = this.userBLL.decryptAES(user.phone);
      return user;
    });

    return responseDTO;
  }
}
