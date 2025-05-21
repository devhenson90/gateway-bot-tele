import { Injectable } from '@nestjs/common';
import { UserAppCredentialRepository } from './repositories/user-app-credential.repository';
import { UserScopeRelationRepository } from 'src/oauth-bundle/user-scope/repositories/user-scope-relation.repository';
import { UserBLL } from 'src/oauth-bundle/user/bll/user.bll';
import { ICRUDService } from 'artifacts/rds/core/common/interfaces/interface.crud.service';
import { UserAppCredentialDTO, UserAppCredentialUnassignmentDTO } from './dto/user-app-credential.dto';
import { UserAppCredentialSearchDTO } from './dto/user-app-credential-search.dto'
import { ResponseDTO } from 'src/common/dto/response.dto';
import { ResponseException } from 'src/common/exception/response.exception';

@Injectable()
export class UserAppCredentialService implements ICRUDService<UserAppCredentialDTO, void> {
  constructor(
    private readonly userAppCredentialRepository: UserAppCredentialRepository,
    private readonly userScopeRelationRepository: UserScopeRelationRepository,
    private readonly userBLL: UserBLL,
  ) {}

  async create(userDTO: UserAppCredentialDTO): Promise<UserAppCredentialDTO> {
    const user = await this.userAppCredentialRepository.insert(userDTO);
    return new UserAppCredentialDTO(user);
  }

  async addAppId(dto: UserAppCredentialDTO): Promise<UserAppCredentialDTO> {
    let userAppCredential: any = await this.userAppCredentialRepository
      .getModel()
      .findOne({
        where: {
          appId: dto.appId,
          userId: dto.userId,
        },
      });
    if (!userAppCredential) {
      userAppCredential = await this.userAppCredentialRepository.insert(dto);
    }
    return new UserAppCredentialDTO(userAppCredential);
  }

  async removeUserAppCredential(dto: UserAppCredentialUnassignmentDTO): Promise<void> {
    let userAppCredential = await this.userAppCredentialRepository
      .getModel()
      .findOne({
        where: {
          appId: dto.appId,
          userId: dto.userId,
        },
      });
    if (!userAppCredential) {
      throw new ResponseException('Data not found');
    }

    await userAppCredential.destroy();
  }

  async read(id: string): Promise<UserAppCredentialDTO> {
    const users = await this.userAppCredentialRepository
      .where({ id: id })
      .findOne({ attributes: { exclude: ['password'] } });
    return new UserAppCredentialDTO(users);
  }

  async getUserCredential(userId: number, appId: number): Promise<UserAppCredentialDTO> {
    const appCredential: any = await this.userAppCredentialRepository
      .getModel()
      .findOne({
        attributes: { exclude: ['pinCode', 'password'] },
        where: {
          appId: appId,
          userId: userId,
        },
      });
    if (!appCredential) {
      return null;
    }
    const userDTO = new UserAppCredentialDTO(appCredential);
    return userDTO;
  }

  async getUser(username: string, excludePW = true): Promise<UserAppCredentialDTO> {
    const userRepository = this.userAppCredentialRepository.where({ username: username });

    let users: any;

    if (excludePW) {
      users = await userRepository.findOne({
        attributes: { exclude: ['password'] },
      });
    } else {
      users = await userRepository.findOne();
    }

    return new UserAppCredentialDTO(users);
  }

  update(requestDTO: UserAppCredentialDTO): Promise<UserAppCredentialDTO> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<void> {
    await this.userAppCredentialRepository.delete({
      where: { id: Number(id) },
    });
  }

  compare(password: string, dbPassword: string): boolean {
    return this.userBLL.compare(password, dbPassword);
  }
}
