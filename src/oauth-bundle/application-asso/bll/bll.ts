import { Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { Op } from 'sequelize';
import * as VIEW_ASSO from 'src/oauth-bundle/application-asso/repositories/application-asso.repository';
import { ApplicationScopeRelationRepository } from 'src/oauth-bundle/application-scope/repositories/application-scope-relation.repository';
import { ApplicationService } from 'src/oauth-bundle/application/application.service';
import { ApplicationDTO } from 'src/oauth-bundle/application/dto/application.dto';
import { RolePermissionAssociationRepository, VIEW } from 'src/oauth-bundle/role-permission/repositories/role-permission.repository';
import { RolePermissionService } from 'src/oauth-bundle/role-permission/role-permission.service';
import { ScopeMasterRepository } from 'src/oauth-bundle/scope-master/repositories/scope-master.repository';
import { SmsConfigurationDTO } from 'src/oauth-bundle/sms-configuration/dto/dto';
import { SmsConfigurationRepository } from 'src/oauth-bundle/sms-configuration/repositories/repository';
import { UserBLL } from 'src/oauth-bundle/user/bll/user.bll';
import { ApplicationAssoService } from '../application-asso.service';
import { ApplicationAssoRepository } from '../repositories/application-asso.repository';

@Injectable()
export class ApplicationAssoBLL {
  constructor(
    private readonly applicationAssoService: ApplicationAssoService,
    private readonly applicationAssoRepository: ApplicationAssoRepository,
    private readonly applicationService: ApplicationService,
    private readonly userBLL: UserBLL,
    private readonly smsConfigurationRepository: SmsConfigurationRepository,
    private readonly applicationScopeRelationRepository: ApplicationScopeRelationRepository,
    private readonly rolePermissionService: RolePermissionService,
    private readonly scopeMasterRepository: ScopeMasterRepository,
    private readonly rolePermissionAssociationRepository: RolePermissionAssociationRepository,
  ) { }

  async create(view: string, applicationAssoDTO: any): Promise<any> {
    // Insert or Update SMS Configuration
    const smsConfig = applicationAssoDTO.smsConfig;

    const smsConfiguration = await this.smsConfigurationRepository.upsert(smsConfig, {
      returning: true,
      where: {
        id: smsConfig.id,
      },
    });

    const resultSmsConfiguration = new SmsConfigurationDTO(smsConfiguration[0]);

    // Insert Application
    const application: ApplicationDTO = applicationAssoDTO.application;
    application.clientId = this.userBLL.generateAccessKeyId();
    application.clientSecret = this.userBLL.generateSecretAccessKeyId();
    application.smsConfigurationId = resultSmsConfiguration.id;

    const applicationCreated = await this.applicationService.create(application);

    // Insert Application scope relation
    if (applicationAssoDTO.scopes && applicationAssoDTO.scopes.length > 0) {
      const scopes = applicationAssoDTO.scopes;

      await this.applicationScopeRelationRepository.bulkInsert(
        [
          ...scopes.map((scopeMasterId: number) => ({
            applicationId: applicationCreated.id,
            scopeMasterId: scopeMasterId,
          }))
        ],
        ['applicationId', 'scopeMasterId'],
      )
    }

    // Insert Roles
    if (applicationAssoDTO.roles && applicationAssoDTO.roles.length > 0) {
      const roles = applicationAssoDTO.roles;

      await Promise.all(
        roles.map((role: any) => {
          role.applicationId = applicationCreated.id;
          return this.rolePermissionService.create(VIEW.ROLE_PERMISSION, role);
        })
      );
    }

    return applicationCreated;
  }

  async update(view: string, applicationAssoDTO: any): Promise<any> {
    // Insert or Update SMS Configuration
    const smsConfig = applicationAssoDTO.smsConfig;

    const smsConfiguration = await this.smsConfigurationRepository.upsert(smsConfig, {
      returning: true,
      where: {
        id: smsConfig.id,
      },
    });

    const resultSmsConfiguration = new SmsConfigurationDTO(smsConfiguration[0]);

    // Update Application
    const application: ApplicationDTO = applicationAssoDTO.application;
    application.smsConfigurationId = resultSmsConfiguration.id;

    const applicationUpdated = await this.applicationService.update(application);

    // Update Application scope relation
    if (applicationAssoDTO.scopes && applicationAssoDTO.scopes.length > 0) {
      const scopes = applicationAssoDTO.scopes;

      const appList: any = await this.applicationAssoRepository.getApplicationRepository().getModel().findByPk(applicationUpdated.id, {
        include: {
          model: this.scopeMasterRepository.getModel(),
          attributes: ['id'],
        },
      });

      const currentScopeMastersIds = appList.scopeMasters.map((scopeMasterId: any) => scopeMasterId.id);

      const idsToAdd = scopes.filter((id: number) => !currentScopeMastersIds.includes(id));
      const idsToRemove = currentScopeMastersIds.filter((id: number) => !scopes.includes(id));

      if (idsToAdd.length > 0) {
        await this.applicationScopeRelationRepository.bulkInsert(
          [
            ...idsToAdd.map((scopeMasterId: number) => ({
              applicationId: applicationUpdated.id,
              scopeMasterId: scopeMasterId,
            }))
          ],
          ['applicationId', 'scopeMasterId'],
        )
      }

      if (idsToRemove.length > 0) {
        await this.applicationScopeRelationRepository.delete(
          {
            where: {
              applicationId: applicationUpdated.id,
              scopeMasterId: {
                [Op.in]: idsToRemove,
              }
            },
          },
        );
      }
    } else {
      const appList: any = await this.applicationAssoRepository.getApplicationRepository().getModel().findByPk(applicationUpdated.id, {
        include: {
          model: this.scopeMasterRepository.getModel(),
          attributes: ['id'],
        },
      });

      const currentScopeMastersIds = appList.scopeMasters.map((scopeMasterId: any) => scopeMasterId.id);

      if (currentScopeMastersIds.length > 0) {
        await this.applicationScopeRelationRepository.delete(
          {
            where: {
              applicationId: applicationUpdated.id,
              scopeMasterId: {
                [Op.in]: currentScopeMastersIds,
              }
            },
          },
        );
      }
    }

    // Update Roles
    if (applicationAssoDTO.roles && applicationAssoDTO.roles.length > 0) {
      const roles = applicationAssoDTO.roles;

      // Separate data into two arrays
      const rolesWithId = roles.map((role: { permissions: any; }) => ({
        ...role,
        permissions: _.filter(role.permissions, permission => _.has(permission, 'id')),
      })).filter((role: { permissions: string | any[]; }) => role.permissions.length > 0);

      const rolesWithoutId = roles.map((role: { permissions: any; }) => ({
        ...role,
        permissions: _.filter(role.permissions, permission => !_.has(permission, 'id')),
      })).filter((role: { permissions: string | any[]; }) => role.permissions.length > 0);

      await Promise.all(
        rolesWithId.map((role: any) => {
          role.applicationId = applicationUpdated.id;
          return this.applicationAssoService.update(VIEW_ASSO.VIEW.ROLE_PERMISSION, role);
        })
      );

      await Promise.all(
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
    }

    // Insert Roles
    if (applicationAssoDTO.rolesAdd && applicationAssoDTO.rolesAdd.length > 0) {
      const roles = applicationAssoDTO.rolesAdd;

      await Promise.all(
        roles.map((role: any) => {
          role.applicationId = applicationUpdated.id;
          return this.rolePermissionService.create(VIEW.ROLE_PERMISSION, role);
        })
      );
    }

    return applicationUpdated;
  }
}
