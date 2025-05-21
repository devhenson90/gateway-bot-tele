import { Injectable } from '@nestjs/common';
import { UserForgotCodeRepository } from './repositories/user-forgot-code.repository';
import { ICRUDService } from 'artifacts/rds/core/common/interfaces/interface.crud.service';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { TCPService } from 'artifacts/microservices/tcp/tcp.service';
import { ResponseException } from 'src/common/exception/response.exception';
import * as dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { ForgotTypeDTO } from './dto/forgot-types.dto';
import { ForgotExpiredReasonEnum, ForgotMethodEnum, ForgotTypesEnum } from './enum/forgot-types.enum';

@Injectable()
export class UserForgotCodeService {
  constructor(
    private readonly tcpService: TCPService,
    private readonly userForgotCodeRepository: UserForgotCodeRepository,
  ) {}

  async create(
    forgotType: ForgotTypesEnum,
    forgotMethod: ForgotMethodEnum,
    userId: number,
  ): Promise<ForgotTypeDTO> {
    const currentDate = dayjs().toDate();
    const forgot = new ForgotTypeDTO();
    forgot.forgotType = forgotType;
    forgot.forgotMethod = forgotMethod;
    forgot.userId = userId;
    forgot.code = nanoid();
    forgot.expiredAt = dayjs().add(15, 'minutes').toDate();
    forgot.expiredReason = ForgotExpiredReasonEnum.timeout;
    await this.userForgotCodeRepository.getModel().update(
      {
        usedAt: currentDate,
        expiredReason: ForgotExpiredReasonEnum.have_new_token,
      },
      {
        where: {
          forgotType,
          forgotMethod,
          userId,
          usedAt: null,
          expiredAt: {
            [Op.gte]: currentDate,
          },
        },
      },
    );
    const newForgot = await this.userForgotCodeRepository.insert(forgot);
    return new ForgotTypeDTO(newForgot);
  }

  async validate(forgotType: string, code: string): Promise<any> {
    const forgot: any = await this.userForgotCodeRepository
      .where({
        forgotType,
        code,
      })
      .findOne();
    if (dayjs().isAfter(dayjs(forgot.expiredAt), 'seconds')) {
      throw new ResponseException('Expired');
    }
    if (forgot.usedAt) {
      if (forgot?.expiredReason === ForgotExpiredReasonEnum.have_new_token) {
        throw new ResponseException('Have new token');
      }
      throw new ResponseException('Already been used');
    }
    return forgot;
  }

  async confirm(forgotType: string, code: string) {
    const forgot: any = await this.validate(forgotType, code);
    await forgot.update({
      usedAt: dayjs().toDate(),
      expiredReason: ForgotExpiredReasonEnum.user_already_used,
    });
    return forgot;
  }
}
