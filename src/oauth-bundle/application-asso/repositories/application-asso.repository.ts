import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import {
  AssociationConfig,
  AssociationConfigList,
  RelationConfig,
  RelationConfigList,
} from 'artifacts/rds/core/config/relation.config';
import {
  RELATION,
  RelationRepository,
} from 'artifacts/rds/core/relation.repository';
import { Op } from 'sequelize';
import { ApplicationScopeRelationRepository } from 'src/oauth-bundle/application-scope/repositories/application-scope-relation.repository';
import { ApplicationRepository } from 'src/oauth-bundle/application/repositories/application.repository';
import { PermissionRepository } from 'src/oauth-bundle/permission/repositories/permission.repository';
import { Status } from 'src/oauth-bundle/role/enum/status.enum';
import { RoleTypeEnum } from 'src/oauth-bundle/role/enum/user-role.enum';
import { RoleRepository } from 'src/oauth-bundle/role/repositories/role.repository';
import { ScopeMasterRepository } from 'src/oauth-bundle/scope-master/repositories/scope-master.repository';
import { SmsConfigurationRepository } from 'src/oauth-bundle/sms-configuration/repositories/repository';

export enum VIEW {
  APPLICATION_ALL = 'application-all',
  ROLE_PERMISSION = 'role-permission',
}

@Injectable()
export class ApplicationAssoRepository extends RelationRepository {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly scopeMasterRepository: ScopeMasterRepository,
    private readonly applicationScopeRelationRepository: ApplicationScopeRelationRepository,
    private readonly smsConfigurationRepository: SmsConfigurationRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {
    super(new Map<string, BaseRepository>());
    for (let repo of arguments) {
      this.initAssociateRepository(repo);
    }
    this.setViews(VIEW);
  }

  getApplicationRepository() {
    return this.applicationRepository;
  }

  getScopeMasterRepository() {
    return this.scopeMasterRepository;
  }

  getApplicationScopeRelationRepository() {
    return this.applicationScopeRelationRepository;
  }

  getMainRepository(): BaseRepository {
    return this.getApplicationRepository();
  }

  getRelationRepository(): BaseRepository {
    return null;
  }

  getRelationTableName(): string {
    return 'application_scope_relations';
  }

  getIdentifierName(): string {
    return '';
  }

  getRelationIdName(): string {
    return '';
  }

  getRolePermissionRelationTableName(): string {
    return 'role_permission_relations';
  }

  protected modelView(view: string): void {
    const compareView = this.getView();
    if (view === compareView[VIEW.APPLICATION_ALL]) {
      this.model = this.getMainRepository().getModel();
    } else if (view === compareView[VIEW.ROLE_PERMISSION]) {
      this.model = this.roleRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }

  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.APPLICATION_ALL, [
      {
        required: false,
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
        through: {
          // attributes: [], // without pivot table
          as: 'applicationScopeRelations',
        },
      },
      {
        required: false,
        model: this.smsConfigurationRepository.getModel(),
        as: 'smsConfiguration',
      },
      {
        required: false,
        model: this.roleRepository.getModel(),
        as: 'roles',
        where: {
          type: RoleTypeEnum.Application,
          status: {
            [Op.ne]: Status.Delete,
          }
        },
        include: [
          {
            required: false,
            model: this.permissionRepository.getModel(),
            as: 'permissions',
            where: {
              status: {
                [Op.ne]: Status.Delete,
              }
            }
          },
        ]
      }
    ]);

    associationConfigList.setInclude(VIEW.ROLE_PERMISSION, [
      {
        required: false,
        model: this.permissionRepository.getModel(),
        as: 'permissions',
        through: {
          as: 'rolePermissionRelations',
        },
      },
    ]);

    return associationConfigList.toArray();
  }
  protected setupAssociation(): void {
    const relationConfigList = new RelationConfigList();
    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.applicationRepository.getModel());
      relation.setAssociateModel(this.scopeMasterRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getRelationTableName(),
          as: 'scopes',
        },
        secondary: {
          through: this.getRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.scopeMasterRepository.getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getRelationTableName(),
        },
        secondary: {
          through: this.getRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.HAS_ONE);
      relation.setEntityModel(this.smsConfigurationRepository.getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        foreignKey: 'id',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO);
      relation.setEntityModel(this.applicationRepository.getModel());
      relation.setAssociateModel(this.smsConfigurationRepository.getModel());
      relation.setBinding({
        foreignKey: 'sms_configuration_id',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.HAS_MANY);
      relation.setEntityModel(this.applicationRepository.getModel());
      relation.setAssociateModel(this.roleRepository.getModel());
      relation.setBinding({
        foreignKey: 'application_id',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO);
      relation.setEntityModel(this.roleRepository.getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        foreignKey: 'id',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.roleRepository.getModel());
      relation.setAssociateModel(this.permissionRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getRolePermissionRelationTableName(),
        },
        secondary: {
          through: this.getRolePermissionRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.permissionRepository.getModel());
      relation.setAssociateModel(this.roleRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getRolePermissionRelationTableName(),
        },
        secondary: {
          through: this.getRolePermissionRelationTableName(),
        },
      });
    });

    this.setRelation(...relationConfigList.toArray());
  }
}
