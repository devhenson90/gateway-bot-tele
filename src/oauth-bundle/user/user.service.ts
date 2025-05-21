import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from 'artifacts/api/service';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ResponseException } from 'src/common/exception/response.exception';
import { Status } from '../role/enum/status.enum';
import { UserAppCredentialRepository } from '../user-app-credential/repositories/user-app-credential.repository';
import {
  ForgotMethodEnum,
  ForgotTypesEnum,
} from '../user-forgot-code/enum/forgot-types.enum';
import { UserForgotCodeService } from '../user-forgot-code/user-forgot-code.service';
import { UserBLL } from './bll/user.bll';
import { UserSearchDTO } from './dto/user-search.dto';
import { SetPasswordDTO, UserChangeCredentialDTO, UserChangePasswordDTO, UserDTO } from './dto/user.dto';
import {
  UserAssociationRepository,
  VIEW,
} from './repositories/user-association.repository';
import { UserRepository } from './repositories/user.repository';

export const UserExcludeAttributes = ['password', 'pinCode'];

@Injectable()
export class UserService extends BaseService<UserDTO> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userAssociationRepository: UserAssociationRepository,
    private readonly userBLL: UserBLL,
    private readonly userForgotCodeService: UserForgotCodeService,
    private readonly userAppCredentialRepository: UserAppCredentialRepository
  ) {
    super(userRepository);
  }

  initUserDTO(dto: UserDTO) {
    dto.phone = this.userBLL.decryptAES(dto.phone);
    return dto;
  }

  async create(userDTO: UserDTO): Promise<UserDTO> {
    if (userDTO.password) {
      userDTO.password = await this.userBLL.encryptPassword(userDTO.password);
    }

    if (userDTO.pinCode) {
      userDTO.pinCode = await this.userBLL.encryptPassword(userDTO.pinCode);
    }

    if (userDTO.phone) {
      userDTO.phone = this.userBLL.encryptAES(userDTO.phone);
    }

    // userDTO.originAppId = oauthApp.id
    userDTO.accessKeyId = this.userBLL.generateAccessKeyId();
    userDTO.secretAccessKeyId = this.userBLL.generateSecretAccessKeyId();

    const user: any = await this.userRepository.insert(userDTO);
    return this.initUserDTO(new UserDTO(user));
  }

  async update(updateDTO: any): Promise<UserDTO> {
    updateDTO.updatedAt = new Date();
    const dataUpdated = await this.userRepository.update(updateDTO, {
      where: { id: updateDTO.id },
      returning: true,
    });

    if (updateDTO.status !== Status.Enable) {
    }

    return this.newEntity(dataUpdated[1][0]);
  }

  async read(id: string): Promise<UserDTO> {
    const users = await this.userRepository
      .where({ id: id })
      .findOne({ attributes: { exclude: UserExcludeAttributes } });
    if (!users) {
      return null;
    }
    return this.initUserDTO(new UserDTO(users));
  }

  async generateForgotToken(
    forgotType: ForgotTypesEnum,
    forgotMethod: ForgotMethodEnum,
    user,
  ): Promise<string> {
    const forgot = await this.userForgotCodeService.create(
      forgotType,
      forgotMethod,
      user.id,
    );
    return forgot.code;
  }

  async verifyForgotEmailOneTimeToken(
    forgotType: ForgotTypesEnum,
    token: string,
  ) {
    const userId = await this.verifyForgotEmailToken(forgotType, token);
    return {
      userId,
      status: 'success',
    };
  }

  async useForgotToken(forgotType: string, token: string): Promise<void> {
    const forgot = await this.userForgotCodeService.confirm(forgotType, token);
  }

  async verifyForgotEmailToken(
    forgotType: string,
    token: string,
  ): Promise<number> {
    const forgot = await this.userForgotCodeService.validate(forgotType, token);
    return forgot.userId;
  }

  async getUserByKey(cond: {
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<UserDTO> {
    const user = await this.userAssociationRepository
      .include(VIEW.LOGIN_JWT).and([
        {
          status: {
            [Op.ne]: Status.Delete
          }
        }
      ])
      .findOne({
        where: {
          ...(cond.username ? { username: cond.username } : {}),
          ...(cond.email ? { email: cond.email } : {}),
          ...(cond.phone ? { phone: cond.phone } : {}),
        },
      });
    return this.initUserDTO(new UserDTO(user));
  }

  async getUser(username: string, excludePW = true): Promise<UserDTO> {
    const userRepository = this.userRepository.where({ username: username });

    let users: any;

    if (excludePW) {
      users = await userRepository.findOne({
        attributes: { exclude: UserExcludeAttributes },
      });
    } else {
      users = await userRepository.findOne();
    }

    return this.initUserDTO(new UserDTO(users));
  }

  async getUserRolePermission(
    username: string,
    excludePW = true,
  ): Promise<UserDTO> {
    const userRepository = this.userAssociationRepository
      .include(VIEW.USER_ROLE)
      .where({ username: username });

    let users: any;

    if (excludePW) {
      users = await userRepository.findOne({
        attributes: { exclude: UserExcludeAttributes },
      });
    } else {
      users = await userRepository.findOne();
    }

    return this.initUserDTO(new UserDTO(users));
  }

  async search(userSearchDTO: UserSearchDTO): Promise<ResponseDTO<UserDTO[]>> {
    const result = await super.search(userSearchDTO, {
      attributes: { exclude: UserExcludeAttributes },
    });
    result.data = result.data.map((u) => this.initUserDTO(u));
    return result;
  }

  async changeCredential(
    userDTO: UserChangeCredentialDTO,
    id: string,
  ): Promise<UserDTO> {
    if (userDTO.password || userDTO.password === '') {
      const errorMsg = this.userBLL.validatePassword(userDTO.password);
      if (errorMsg) {
        throw new ResponseException(errorMsg);
      }
    }
    if (userDTO.oldPassword) {
      const user: any = await this.userRepository
        .where({
          id: Number(id),
        })
        .findOne();
      const isPasswordValid = await this.userBLL.compare(
        userDTO.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ResponseException('Invalid old password');
      }
    }

    const toUpdate: Partial<UserChangeCredentialDTO> = _.pick(userDTO, [
      'username',
      'email',
      'password',
      'pinCode',
      'status',
    ]);

    if (userDTO.username || userDTO.email) {
      const isCheckUser: any = await this.checkDuplicateUsernameOrEmail(
        userDTO.username,
        userDTO.email,
        id,
      );
      if (isCheckUser) {
        throw new ResponseException(isCheckUser);
      }
    }

    if (toUpdate.password) {
      toUpdate.password = await this.userBLL.encryptPassword(userDTO.password);
    }

    if (toUpdate.pinCode) {
      toUpdate.pinCode = await this.userBLL.encryptPassword(userDTO.pinCode);
    }

    let user = {};
    if (!_.isEmpty(toUpdate)) {
      user = await this.userRepository.update(toUpdate, {
        where: { id: Number(id) },
      });
    }

    if (!_.isEmpty(userDTO.appIds) && _.isArray(userDTO.appIds)) {
      const sourcesAppCredential = await this.userAppCredentialRepository
        .getModel()
        .findAll({
          where: { userId: Number(id) },
        });
      const updatedsAppCredential: any = _.map(userDTO.appIds, (appId) => ({
        userId: Number(id),
        appId: Number(appId),
      }));

      await this.userAppCredentialRepository.replaceDeltaArray(
        sourcesAppCredential,
        updatedsAppCredential,
        {
          ignoreUpdated: true,
          keyFunc: (i) => i.appId,
        },
      );
    }
    return this.initUserDTO(new UserDTO(user));
  }

  async changePIN(
    appId: number,
    userId: number,
    newPinCode: string,
  ): Promise<UserDTO> {
    const bPinCode = await this.userBLL.encryptPassword(newPinCode);
    const toUpdate = {
      pinCode: bPinCode,
    };
    const user = await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
    return this.initUserDTO(new UserDTO(user));
  }

  async changePassword(userId: number, userDTO: UserChangePasswordDTO): Promise<UserDTO> {
    if (userDTO.oldPassword) {
      const user: any = await this.userRepository
        .where({
          id: Number(userId),
        })
        .findOne();
      const isPasswordValid = await this.userBLL.compare(
        userDTO.oldPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new ResponseException('Invalid old password');
      }
    } else {
      throw new ResponseException('Invalid old password');
    }

    const bPassword = await this.userBLL.encryptPassword(userDTO.password);
    const toUpdate = {
      password: bPassword,
      lastUpdatedPassword: new Date(),
    };
    const user = await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
    return this.initUserDTO(new UserDTO(user));
  }

  async setPassword(userId: number, userDTO: SetPasswordDTO): Promise<UserDTO> {
    if (userDTO.password !== userDTO.confirmPassword) {
      throw new ResponseException('Password not match');
    }

    const oldData: any = await this.userRepository
      .where({
        id: Number(userId),
      })
      .findOne();

    if (!oldData.isFirstLogin) {
      throw new ResponseException('You have already set a new password');
    }

    const bPassword = await this.userBLL.encryptPassword(userDTO.password);
    const toUpdate = {
      password: bPassword,
      isFirstLogin: false,
      lastUpdatedPassword: new Date(),
    };
    const user = await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
    return this.initUserDTO(new UserDTO(user));
  }

  async stampLoginEvent(userId: number): Promise<void> {
    try {
      const toUpdate = {
        lastLoginAt: new Date(),
      };
      await this.userRepository.update(toUpdate, {
        where: {
          id: Number(userId),
        },
      });
    } catch (err) {
      Logger.error(err, err.stack, UserService.name);
    }
  }

  async stampLastActiveEvent(userId: number): Promise<void> {
    try {
      const toUpdate = {
        lastActiveAt: new Date(),
      };
      await this.userRepository.update(toUpdate, {
        where: {
          id: Number(userId),
        },
      });
    } catch (err) {
      Logger.error(err, err.stack, UserService.name);
    }
  }

  compare(password: string, dbPassword: string): boolean {
    return this.userBLL.compare(password, dbPassword);
  }

  async checkDuplicateUsernameOrEmail(
    username: string,
    email: string,
    id?: string,
  ): Promise<any> {
    let checkUsername = false;
    let checkEmail = false;
    const dataUser: any = await this.userRepository
      .or([
        {
          username: {
            [Op.iLike]: username,
          },
        },
        {
          email: {
            [Op.iLike]: email,
          },
        },
      ]).and([
        {
          status: {
            [Op.ne]: Status.Delete
          }
        }
      ])
      .findAll();

    dataUser.forEach((user) => {
      if (id) {
        if (
          !!username &&
          username.toLowerCase() == user.username?.toLowerCase() &&
          id != user.id
        ) {
          checkUsername = true;
        }
        if (
          !!email &&
          email.toLowerCase() == user.email?.toLowerCase() &&
          id != user.id
        ) {
          checkEmail = true;
        }
      } else {
        if (
          !!username &&
          username.toLowerCase() == user.username?.toLowerCase()
        ) {
          checkUsername = true;
        }
        if (!!email && email.toLowerCase() == user.email?.toLowerCase()) {
          checkEmail = true;
        }
      }
    });

    if (!checkUsername && !checkEmail) {
      return false;
    } else {
      const message = `${checkUsername ? 'username ' : ''}${checkEmail ? `${checkUsername ? 'and ' : ''}email ` : ''}already registered`;
      return message;
    }
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    const toUpdate = {
      twoFactorSecret: secret,
    };
    await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
  }

  async isMfaVerification(userId: number): Promise<boolean> {
    const data = await this.userRepository.where({ id: userId }).findOne();
    const user = this.newEntity(data);
    return user.isMfaVerification;
  }

  async setIsMfaEnabled(isMfaEnabled: boolean, userId: number) {
    const toUpdate = {
      isMfaEnabled: isMfaEnabled,
    };
    await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
  }

  async turnOnMfa(userId: number) {
    const toUpdate = {
      isMfaEnabled: true,
      isMfaVerification: true,
    };
    await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
  }

  async turnOffMfa(userId: number) {
    const toUpdate = {
      isMfaEnabled: false,
      isMfaVerification: false,
      twoFactorSecret: null,
    };
    await this.userRepository.update(toUpdate, {
      where: {
        id: Number(userId),
      },
    });
  }

  async readByUserEmail(email: string): Promise<UserDTO> {
    const data = await this.userRepository.where({ email }).findOne();
    return this.newEntity(data);
  }
}
