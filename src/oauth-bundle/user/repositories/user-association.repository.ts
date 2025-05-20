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
import { ApplicationRepository } from 'src/oauth-bundle/application/repositories/application.repository';
import { PermissionRepository } from 'src/oauth-bundle/permission/repositories/permission.repository';
import { Status } from 'src/oauth-bundle/role/enum/status.enum';
import { RoleRepository } from 'src/oauth-bundle/role/repositories/role.repository';
import { UserAppCredentialRepository } from 'src/oauth-bundle/user-app-credential/repositories/user-app-credential.repository';
import { UserRepository } from './user.repository';

export enum VIEW {
  USER_ROLE = 'users-role',
  LOGIN_JWT = 'login-jwt',
}

@Injectable()
export class UserAssociationRepository extends RelationRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly userAppCredentialRepository: UserAppCredentialRepository,
    private readonly applicationRepository: ApplicationRepository,
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
  getRelationRepository(): BaseRepository {
    return null;
  }

  getRelationTableName(): string {
    return 'role_permission_relations';
  }
  getIdentifierName(): string {
    return '';
  }
  getRelationIdName(): string {
    return '';
  }

  getAppCredentialsName(): string {
    return 'appCredentials';
  }
  protected modelView(view: string): void {
    this.model = this.getMainRepository().getModel();
  }
  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude('role', []);
    associationConfigList.setInclude(VIEW.USER_ROLE, [
      {
        model: this.roleRepository.getModel(),
        include: [
          {
            model: this.permissionRepository.getModel(),
            through: {
              attributes: [
                // ['role_id', 'roleId'],
                'roleId',
                'permissionId',
                'createdAt',
                'updatedAt',
              ],
              // attributes: [], // without pivot table
              as: 'rolePermissions',
            },
          },
        ],
      },
    ]);
    associationConfigList.setInclude(VIEW.LOGIN_JWT, [
      {
        required: false,
        attributes: ['name', 'type'],
        model: this.roleRepository.getModel(),
        through: {
          attributes: [],
        },
        include: [
          {
            required: false,
            attributes: ['name', 'permission'],
            model: this.permissionRepository.getModel(),
            through: {
              attributes: [],
              // attributes: [], // without pivot table
              as: 'rolePermissions',
            },
            where: {
              status: Status.Enable,
            },
          },
        ],
        where: {
          status: Status.Enable,
        },
      },
      {
        required: false,
        attributes: ['id', 'clientId'],
        model: this.applicationRepository.getModel(),
        as: this.getAppCredentialsName(),
        through: {
          attributes: [],
        },
        where: {
          status: Status.Enable,
        },
      },
    ]);
    return associationConfigList.toArray();
  }

  protected setupAssociation(): void {
    const relationConfigList = new RelationConfigList();
    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.roleRepository.getModel());
      relation.setAssociateModel(this.permissionRepository.getModel());
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
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.applicationRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.userAppCredentialRepository.getModel(),
          as: this.getAppCredentialsName(),
          foreignKey: 'userId',
          otherKey: 'appId',
        },
        secondary: {
          through: this.userAppCredentialRepository.getModel(),
        },
      });
    });
    this.setRelation(...relationConfigList.toArray());
  }
}
