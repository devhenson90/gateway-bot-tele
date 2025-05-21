import { Injectable } from '@nestjs/common';
import { TMPAuthCodeRepository } from './repositories/tmp-auth-code.repository';
import { TMPAuthCodeDTO } from './dto/tmp-auth-code.dto';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TMPAuthCodeSearchDTO } from './dto/tmp-auth-code-search.dto';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { BaseService } from 'artifacts/api/service';

@Injectable()
export class TMPAuthCodeService extends BaseService<TMPAuthCodeDTO> {
  constructor(
    private readonly tcpService: TCPService,
    private readonly tmpAuthCodeRepository: TMPAuthCodeRepository,
  ) {
    super(tmpAuthCodeRepository);
    this.tcpService.addTCPMessageHandler('tmpauthcodeservice', this);
  }

  async create(tmpAuthCodeDTO: TMPAuthCodeDTO): Promise<TMPAuthCodeDTO> {
    const tmpAuthCode = await this.tmpAuthCodeRepository.insert(tmpAuthCodeDTO);
    return new TMPAuthCodeDTO(tmpAuthCode);
  }

  async read(id: string): Promise<TMPAuthCodeDTO> {
    const tmpAuthCode = await this.tmpAuthCodeRepository
      .where({ id: id }, 'id')
      .findOne();
    return new TMPAuthCodeDTO(tmpAuthCode);
  }

  async readByAppIdAndUserId(
    appId: number,
    userId: string,
  ): Promise<TMPAuthCodeDTO> {
    const tmpAuthCode = await this.tmpAuthCodeRepository
      .where({ appId: appId, userId: userId })
      .order('id', 'DESC')
      .findOne();
    return new TMPAuthCodeDTO(tmpAuthCode);
  }

  async readByAppIdAndCode(
    appId: number,
    code: string,
  ): Promise<TMPAuthCodeDTO> {
    const tmpAuthCode = await this.tmpAuthCodeRepository
      .where({ appId: appId, code: code })
      .order('id', 'DESC')
      .findOne();
    return new TMPAuthCodeDTO(tmpAuthCode);
  }

  async searchTMPAuthCode(
    tmpAuthCodeSearchDTO: TMPAuthCodeSearchDTO,
  ): Promise<ResponseDTO<TMPAuthCodeDTO[]>> {
    this.tmpAuthCodeRepository.page(
      tmpAuthCodeSearchDTO.page,
      tmpAuthCodeSearchDTO.limit,
    );

    if (tmpAuthCodeSearchDTO.query) {
      this.tmpAuthCodeRepository.where({
        name: { [Op.iLike]: `%${tmpAuthCodeSearchDTO.query}%` },
      });
    }
    if (tmpAuthCodeSearchDTO.status && tmpAuthCodeSearchDTO.status !== 'all') {
      this.tmpAuthCodeRepository.where({
        status: tmpAuthCodeSearchDTO.status,
      });
    }
    if (tmpAuthCodeSearchDTO.orderBy) {
      if (tmpAuthCodeSearchDTO.orderType === 'asc') {
        this.tmpAuthCodeRepository.order(tmpAuthCodeSearchDTO.orderBy, 'ASC');
      } else {
        this.tmpAuthCodeRepository.order(tmpAuthCodeSearchDTO.orderBy, 'DESC');
      }
    }
    if (tmpAuthCodeSearchDTO.between && tmpAuthCodeSearchDTO.betweenDate) {
      const betweenCondition = {};
      betweenCondition[tmpAuthCodeSearchDTO.between] = {
        [Op.between]: [
          new Date(tmpAuthCodeSearchDTO.getStartDate()).toUTCString(),
          new Date(tmpAuthCodeSearchDTO.getEndDate()).toUTCString(),
        ],
      };
      this.tmpAuthCodeRepository.where(betweenCondition);
    }

    const tmpAuthCodeDTOs: TMPAuthCodeDTO[] = [];
    const responseDTO = new ResponseDTO<TMPAuthCodeDTO[]>();

    if (tmpAuthCodeSearchDTO.count) {
      const { count, rows } = await this.tmpAuthCodeRepository.findAndCountAll({
        distinct: true,
      });
      responseDTO.totalItems = count;
      responseDTO.data = Object.assign(tmpAuthCodeDTOs, rows);
    } else {
      responseDTO.data = Object.assign(
        tmpAuthCodeDTOs,
        await this.tmpAuthCodeRepository.findAll(),
      );
    }
    return responseDTO;
  }

  async update(updateDTO: TMPAuthCodeDTO): Promise<TMPAuthCodeDTO> {
    updateDTO.updatedAt = new Date();

    const tmpAuthCodeUpdated = await this.tmpAuthCodeRepository.update(
      updateDTO,
      {
        where: { id: updateDTO.id },
        returning: true,
      },
    );

    return new TMPAuthCodeDTO(tmpAuthCodeUpdated[1][0]);
  }

  async delete(id: string): Promise<any> {
    return {
      deleteCount: await this.tmpAuthCodeRepository.where({ id: id }).delete(),
    };
  }
}
