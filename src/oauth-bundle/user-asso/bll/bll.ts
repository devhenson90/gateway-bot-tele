import { Injectable } from '@nestjs/common';
import { SCOPE_ALLOWED } from 'artifacts/auth/rules/enums';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import { ResponseException } from 'src/common/exception/response.exception';
import { RolePermissionAssociationRepository, VIEW } from 'src/oauth-bundle/role-permission/repositories/role-permission.repository';
import { RolePermissionService } from 'src/oauth-bundle/role-permission/role-permission.service';
import { ScopeMasterService } from 'src/oauth-bundle/scope-master/scope-master.service';
import { UserAppCredentialRepository } from 'src/oauth-bundle/user-app-credential/repositories/user-app-credential.repository';
import * as VIEW_ASSO from 'src/oauth-bundle/user-asso/repositories/user-asso.repository';
import { UserRoleRelationRepository } from 'src/oauth-bundle/user-role/repositories/user-role-relation.repository';
import { UserScopeRelationRepository } from 'src/oauth-bundle/user-scope/repositories/user-scope-relation.repository';
import { VIEW as VIEW_USER_SCOPE } from 'src/oauth-bundle/user-scope/repositories/user-scope.repository';
import { UserScopeService } from 'src/oauth-bundle/user-scope/user-scope.service';
import { UserBLL } from 'src/oauth-bundle/user/bll/user.bll';
import { UserDTO } from 'src/oauth-bundle/user/dto/user.dto';
import { UserRepository } from 'src/oauth-bundle/user/repositories/user.repository';
import { UserService } from 'src/oauth-bundle/user/user.service';
import { UserAssoRepository } from '../repositories/user-asso.repository';
import { UserAssoService } from '../user-asso.service';

@Injectable()
export class UserAssoBLL {
  constructor(
    private readonly userBLL: UserBLL,
    private readonly userRepository: UserRepository,
    private readonly userScopeRelationRepository: UserScopeRelationRepository,
    private readonly userAppCredentialRepository: UserAppCredentialRepository,
    private readonly rolePermissionService: RolePermissionService,
    private readonly userRoleRelationRepository: UserRoleRelationRepository,
    private readonly userAssoService: UserAssoService,
    private readonly userAssoRepository: UserAssoRepository,
    private readonly rolePermissionAssociationRepository: RolePermissionAssociationRepository,
    private readonly userService: UserService,
    private readonly scopeMasterService: ScopeMasterService,
    private readonly userScopeService: UserScopeService
  ) { }

  async create(view: string, userAssoDTO: any): Promise<any> {
    // Check if user already exists
    const isCheckUser: any = await this.userService.checkDuplicateUsernameOrEmail(
      userAssoDTO.user.username,
      userAssoDTO.user.email,
    );
    if (isCheckUser) {
      throw new ResponseException(isCheckUser);
    }

    // Check scope "gateway_service can be assigned only once"
    if (userAssoDTO.scopes && userAssoDTO.scopes.length > 0) {
      const scopes = userAssoDTO.scopes;
      const allowScope = await this.scopeMasterService.readByScope(SCOPE_ALLOWED.GATEWAY_SERVICE);

      const checkScope = await this.userScopeRelationRepository.findOne({
        where: {
          scopeMasterId: allowScope.id,
        },
      });

      if (checkScope && allowScope && scopes.includes(allowScope.id)) {
        throw new ResponseException("Scope gateway can be assigned only once");
      }
    }

    // Insert or Update User
    const user = new UserDTO(userAssoDTO.user);
    if (user.password) {
      user.password = await this.userBLL.encryptPassword(user.password);
    }

    if (user.pinCode) {
      user.pinCode = await this.userBLL.encryptPassword(user.pinCode);
    }

    if (user.phone) {
      user.phone = this.userBLL.encryptAES(user.phone);
    }

    user.accessKeyId = this.userBLL.generateAccessKeyId();
    user.secretAccessKeyId = this.userBLL.generateSecretAccessKeyId();

    const userUpsert = await this.userRepository.upsert(user, {
      returning: true,
      where: {
        id: user.id,
      },
    });

    const resultUser = new UserDTO(userUpsert[0]);
    resultUser.phone = this.userBLL.decryptAES(resultUser.phone);

    // Insert user application relation
    if (userAssoDTO.applications && userAssoDTO.applications.length > 0) {
      const applications = userAssoDTO.applications;

      await this.userAppCredentialRepository.bulkInsert(
        [
          ...applications.map((appId: number) => ({
            appId,
            userId: resultUser.id,
          }))
        ],
        ['appId', 'userId'],
      )
    }

    // Insert user scope relation
    if (userAssoDTO.scopes && userAssoDTO.scopes.length > 0) {
      const scopes = userAssoDTO.scopes;

      await this.userScopeRelationRepository.bulkInsert(
        [
          ...scopes.map((scopeMasterId: number) => ({
            userId: resultUser.id,
            scopeMasterId: scopeMasterId,
          }))
        ],
        ['userId', 'scopeMasterId'],
      )
    }

    // Insert Roles
    if (userAssoDTO.roles && userAssoDTO.roles.length > 0) {
      const roles = userAssoDTO.roles;

      const result = await Promise.all(
        roles.map(async (role: any) => {
          if (role.applicationId) {
            const appId: any = await this.userAssoRepository.getRoleRepository().getModel().findOne({
              where: {
                applicationId: role.applicationId,
                name: role.name
              }
            });
            if (appId) {
              return appId;
            }
            return null;
          } else {
            return this.rolePermissionService.create(VIEW.ROLE_PERMISSION, role);
          }
        })
      );

      const resultRoles = _.compact(result);

      await this.userRoleRelationRepository.bulkInsert(
        [
          ...resultRoles.map((r: any) => ({
            userId: resultUser.id,
            roleId: r.id,
          }))
        ],
        ['userId', 'roleId'],
      )
    }

    return resultUser;
  }

  async update(view: string, userAssoDTO: any): Promise<any> {
    // Check if user already exists
    const isCheckUser: any = await this.userService.checkDuplicateUsernameOrEmail(
      userAssoDTO.user.username,
      userAssoDTO.user.email,
      userAssoDTO.user.id,
    );
    if (isCheckUser) {
      throw new ResponseException(isCheckUser);
    }

    // Check scope "gateway_service can be assigned only once"
    if (userAssoDTO.scopes && userAssoDTO.scopes.length > 0) {
      const scopes = userAssoDTO.scopes;
      const allowScope = await this.scopeMasterService.readByScope(SCOPE_ALLOWED.GATEWAY_SERVICE);
      const userScope = await this.userScopeService.read(VIEW_USER_SCOPE.USER_SCOPE, userAssoDTO.user.id);
      const checkScope = userScope.scopes.some((s: any) => s.id === allowScope.id);

      if (!checkScope && allowScope && scopes.includes(allowScope.id)) {
        throw new ResponseException("Scope gateway can be assigned only once");
      }
    }

    const oldUserData: any = await this.userRepository.findOne({
      where: {
        id: userAssoDTO.user.id,
      },
    })

    // Insert or Update User
    const user = new UserDTO(userAssoDTO.user);
    user.adminConsoleId = oldUserData.adminConsoleId;
    user.status = oldUserData.status;

    if (user.password) {
      user.password = await this.userBLL.encryptPassword(user.password);
    }

    if (user.pinCode) {
      user.pinCode = await this.userBLL.encryptPassword(user.pinCode);
    }

    if (user.phone) {
      user.phone = this.userBLL.encryptAES(user.phone);
    }

    user.accessKeyId = this.userBLL.generateAccessKeyId();
    user.secretAccessKeyId = this.userBLL.generateSecretAccessKeyId();

    const userUpsert = await this.userRepository.upsert(user, {
      returning: true,
      where: {
        id: user.id,
      },
    });

    const resultUser = new UserDTO(userUpsert[0]);
    resultUser.phone = this.userBLL.decryptAES(resultUser.phone);

    // Update user application relation
    if (userAssoDTO.applications && userAssoDTO.applications.length > 0) {
      const applications = userAssoDTO.applications;

      const userList: any = await this.userAssoRepository.getMainRepository().getModel().findByPk(resultUser.id, {
        include: {
          model: this.userAssoRepository.getApplicationRepository().getModel(),
          attributes: ['id'],
        },
      });

      const currentAppIds = userList.applications.map((appId: any) => appId.id);

      const idsToAdd = applications.filter((id: number) => !currentAppIds.includes(id));
      const idsToRemove = currentAppIds.filter((id: number) => !applications.includes(id));

      if (idsToAdd.length > 0) {
        await this.userAppCredentialRepository.bulkInsert(
          [
            ...idsToAdd.map((appId: number) => ({
              appId,
              userId: resultUser.id,
            }))
          ],
          ['appId', 'userId'],
        )
      }

      if (idsToRemove.length > 0) {
        await this.userAppCredentialRepository.delete(
          {
            where: {
              userId: resultUser.id,
              appId: {
                [Op.in]: idsToRemove,
              }
            },
          },
        );
      }
    } else {
      const userList: any = await this.userAssoRepository.getMainRepository().getModel().findByPk(resultUser.id, {
        include: {
          model: this.userAssoRepository.getApplicationRepository().getModel(),
          attributes: ['id'],
        },
      });

      const currentAppIds = userList.applications.map((appId: any) => appId.id);

      if (currentAppIds.length > 0) {
        await this.userAppCredentialRepository.delete(
          {
            where: {
              userId: resultUser.id,
              appId: {
                [Op.in]: currentAppIds,
              }
            },
          },
        );
      }
    }

    // Update user scope relation
    if (userAssoDTO.scopes && userAssoDTO.scopes.length > 0) {
      const scopes = userAssoDTO.scopes;

      const userList: any = await this.userAssoRepository.getMainRepository().getModel().findByPk(resultUser.id, {
        include: {
          model: this.userAssoRepository.getScopeMasterRepository().getModel(),
          attributes: ['id'],
        },
      });

      const currentScopeMastersIds = userList.scopeMasters.map((scopeMasterId: any) => scopeMasterId.id);

      const idsToAdd = scopes.filter((id: number) => !currentScopeMastersIds.includes(id));
      const idsToRemove = currentScopeMastersIds.filter((id: number) => !scopes.includes(id));

      if (idsToAdd.length > 0) {
        await this.userScopeRelationRepository.bulkInsert(
          [
            ...idsToAdd.map((scopeMasterId: number) => ({
              userId: resultUser.id,
              scopeMasterId: scopeMasterId,
            }))
          ],
          ['userId', 'scopeMasterId'],
        )
      }

      if (idsToRemove.length > 0) {
        await this.userScopeRelationRepository.delete(
          {
            where: {
              userId: resultUser.id,
              scopeMasterId: {
                [Op.in]: idsToRemove,
              }
            },
          },
        );
      }
    } else {
      const userList: any = await this.userAssoRepository.getMainRepository().getModel().findByPk(resultUser.id, {
        include: {
          model: this.userAssoRepository.getScopeMasterRepository().getModel(),
          attributes: ['id'],
        },
      });

      const currentScopeMastersIds = userList.scopeMasters.map((scopeMasterId: any) => scopeMasterId.id);

      if (currentScopeMastersIds.length > 0) {
        await this.userScopeRelationRepository.delete(
          {
            where: {
              userId: resultUser.id,
              scopeMasterId: {
                [Op.in]: currentScopeMastersIds,
              }
            },
          },
        );
      }
    }

    // Update Roles
    if (userAssoDTO.roles && userAssoDTO.roles.length > 0) {
      const roles = userAssoDTO.roles;

      // Separate data into two arrays
      const rolesWithId = roles.map((role: { permissions: any; }) => ({
        ...role,
        permissions: _.filter(role.permissions, permission => _.has(permission, 'id')),
      })).filter((role: { permissions: string | any[]; }) => role.permissions.length > 0);

      const rolesWithoutId = roles.map((role: { permissions: any; }) => ({
        ...role,
        permissions: _.filter(role.permissions, permission => !_.has(permission, 'id')),
      })).filter((role: { permissions: string | any[]; }) => role.permissions.length > 0);

      const resultRoles = await Promise.all(
        rolesWithId.map((role: any) => {
          if (role.applicationId) {
            if (role.status === 'delete') {
              return null;
            } else {
              return { roles: [role] };
            }
          }
          return this.userAssoService.update(VIEW_ASSO.VIEW.ROLE_PERMISSION, role);
        })
      );

      const result = _.compact(resultRoles);

      const newPermissions = await Promise.all(
        rolesWithoutId.map(async (role: any) => {
          return Promise.all(role.permissions.map(async (permission: any) => {
            const newPermission: any = await this.rolePermissionAssociationRepository.getPermissionRepository().insert(permission);

            return this.rolePermissionAssociationRepository.getRolePermissionRelationRepository().insert({
              permissionId: newPermission.id,
              roleId: role.id
            });
          }));
        })
      );

      let rolesIds: any[] = [];
      if (result.length > 0) {
        rolesIds = result.map((role: any) => role.roles.map((r: any) => r.id)).flat();
      }

      if (newPermissions.length > 0) {
        rolesIds.push(...newPermissions.flat().map((p: any) => p.roleId));
      }

      const userList: any = await this.userAssoRepository.getMainRepository().getModel().findByPk(resultUser.id, {
        include: {
          model: this.userAssoRepository.getRoleRepository().getModel(),
          attributes: ['id'],
        },
      });

      const currentRoleIds = userList.roles.map((roleId: any) => roleId.id);

      const idsToAdd = rolesIds.filter((id: number) => !currentRoleIds.includes(id));
      const idsToRemove = currentRoleIds.filter((id: number) => !rolesIds.includes(id));

      const idsToAddUnique = _.uniq(idsToAdd);
      const idsToRemoveUnique = _.uniq(idsToRemove);

      if (idsToAddUnique.length > 0) {
        await this.userRoleRelationRepository.bulkInsert(
          [
            ...idsToAddUnique.map((r: any) => ({
              userId: resultUser.id,
              roleId: r,
            }))
          ],
          ['userId', 'roleId'],
        )
      }

      if (idsToRemoveUnique.length > 0) {
        await this.userRoleRelationRepository.delete(
          {
            where: {
              userId: resultUser.id,
              roleId: {
                [Op.in]: idsToRemoveUnique,
              }
            },
          },
        );
      }
    }

    // Insert Roles
    if (userAssoDTO.rolesAdd && userAssoDTO.rolesAdd.length > 0) {
      const roles = userAssoDTO.rolesAdd;

      const result = await Promise.all(
        roles.map(async (role: any) => {
          if (role.applicationId) {
            const appId: any = await this.userAssoRepository.getRoleRepository().getModel().findOne({
              where: {
                applicationId: role.applicationId,
                name: role.name
              }
            });
            if (appId) {
              return appId;
            }
            return null;
          } else {
            return this.rolePermissionService.create(VIEW.ROLE_PERMISSION, role);
          }
        })
      );

      const resultRoles = _.compact(result);

      await this.userRoleRelationRepository.bulkInsert(
        [
          ...resultRoles.map((r: any) => ({
            userId: resultUser.id,
            roleId: r.id,
          }))
        ],
        ['userId', 'roleId'],
      )
    }

    return resultUser;
  }
}
