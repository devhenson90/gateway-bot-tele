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
import { Op, Sequelize } from 'sequelize';
import { ApplicationRepository } from 'src/oauth-bundle/application/repositories/application.repository';
import { PermissionRepository } from 'src/oauth-bundle/permission/repositories/permission.repository';
import { Status } from 'src/oauth-bundle/role/enum/status.enum';
import { RoleRepository } from 'src/oauth-bundle/role/repositories/role.repository';
import { ScopeMasterRepository } from 'src/oauth-bundle/scope-master/repositories/scope-master.repository';
import { UserRepository } from 'src/oauth-bundle/user/repositories/user.repository';

export enum VIEW {
  USER_ALL = 'user-all',
  ROLE_PERMISSION = 'role-permission',
  ROLE_PERMISSION_RELATIONS = 'role-permission-relations',
  USER_APPLICATION = 'user-application',
}

@Injectable()
export class UserAssoRepository extends RelationRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicationRepository: ApplicationRepository,
    private readonly scopeMasterRepository: ScopeMasterRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository
  ) {
    super(new Map<string, BaseRepository>());
    for (let repo of arguments) {
      this.initAssociateRepository(repo);
    }
    this.setViews(VIEW);
  }

  getMainRepository(): BaseRepository {
    return this.userRepository;
  }

  getApplicationRepository(): BaseRepository {
    return this.applicationRepository;
  }

  getScopeMasterRepository(): BaseRepository {
    return this.scopeMasterRepository;
  }

  getRoleRepository(): BaseRepository {
    return this.roleRepository;
  }

  getRelationRepository(): BaseRepository {
    return null;
  }

  getRelationTableName(): string {
    return '';
  }
  getIdentifierName(): string {
    return '';
  }
  getRelationIdName(): string {
    return '';
  }

  getUserRoleRelationTableName(): string {
    return 'user_role_relations';
  }

  getRolePermissionRelationTableName(): string {
    return 'role_permission_relations';
  }

  getUserApplicationRelationTableName(): string {
    return 'user_app_credentials';
  }

  getUserScopeRelationTableName(): string {
    return 'user_scope_relations';
  }

  protected modelView(view: string): void {
    const compareView = this.getView();
    if (view === compareView[VIEW.USER_ALL]) {
      this.model = this.getMainRepository().getModel();
    } else if (view === compareView[VIEW.ROLE_PERMISSION]) {
      this.model = this.roleRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }

  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.USER_ALL, [
      {
        required: false,
        model: this.applicationRepository.getModel(),
        as: 'applications',
      },
      {
        required: false,
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
      },
      {
        required: false,
        model: this.roleRepository.getModel(),
        as: 'roles',
        through: {
          attributes: [], // without pivot table
          as: this.getUserRoleRelationTableName(),
        },
        where: {
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
            },
            through: {
              attributes: [], // without pivot table
              as: this.getRolePermissionRelationTableName(),
            },
          },
        ],
      },
    ]);

    return associationConfigList.toArray();
  }

  protected setupRelationConfig(): RelationConfig[] {
    const relationConfigList = new RelationConfigList();

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.getMainRepository().getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        through: {
          model: this.getUserApplicationRelationTableName(),
        },
        foreignKey: 'userId',
        otherKey: 'applicationId',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.getMainRepository().getModel());
      relation.setAssociateModel(this.scopeMasterRepository.getModel());
      relation.setBinding({
        through: {
          model: this.getUserScopeRelationTableName(),
        },
        foreignKey: 'userId',
        otherKey: 'scopeId',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.getMainRepository().getModel());
      relation.setAssociateModel(this.roleRepository.getModel());
      relation.setBinding({
        through: {
          model: this.getUserRoleRelationTableName(),
        },
        foreignKey: 'userId',
        otherKey: 'roleId',
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.getMainRepository().getModel());
      relation.setAssociateModel(this.permissionRepository.getModel());
      relation.setBinding({
        through: {
          as: 'rolePermissionRelations',
        },
      });
    });

    return relationConfigList.toArray();
  }

  protected setupAssociation(): void {
    const relationConfigList = new RelationConfigList();

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserApplicationRelationTableName(),
          foreignKey: 'user_id',
        },
        secondary: {
          through: this.getUserApplicationRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.applicationRepository.getModel());
      relation.setAssociateModel(this.userRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserApplicationRelationTableName(),
          foreignKey: 'app_id',
        },
        secondary: {
          through: this.getUserApplicationRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.scopeMasterRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserScopeRelationTableName(),
          as: 'scopes',
        },
        secondary: {
          through: this.getUserScopeRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.scopeMasterRepository.getModel());
      relation.setAssociateModel(this.userRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserScopeRelationTableName(),
        },
        secondary: {
          through: this.getUserScopeRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.roleRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserRoleRelationTableName(),
        },
        secondary: {
          through: this.getUserRoleRelationTableName(),
        },
      });
    });

    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.roleRepository.getModel());
      relation.setAssociateModel(this.userRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserRoleRelationTableName(),
        },
        secondary: {
          through: this.getUserRoleRelationTableName(),
        },
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
