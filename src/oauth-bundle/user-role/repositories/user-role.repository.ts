import { Injectable } from '@nestjs/common';
import {
  RELATION,
  RelationRepository,
} from 'artifacts/rds/core/relation.repository';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import {
  AssociationConfig,
  AssociationConfigList,
  RelationConfigList,
  RelationConfig,
} from 'artifacts/rds/core/config/relation.config';
import { UserRoleRelationRepository } from './user-role-relation.repository';
import { UserRepository } from 'src/oauth-bundle/user/repositories/user.repository';
import { RoleRepository } from 'src/oauth-bundle/role/repositories/role.repository';
import { RoleTypeEnum } from 'src/oauth-bundle/role/enum/user-role.enum';
import { PermissionRepository } from 'src/oauth-bundle/permission/repositories/permission.repository';
import { RolePermissionRelationRepository } from 'src/oauth-bundle/role-permission/repositories/role-permission-relation.repository';

export enum VIEW {
  USER_ROLE = 'user-role',
  ROLE = 'role',
}

@Injectable()
export class UserRoleRepository extends RelationRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRoleRelationRepository: UserRoleRelationRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionRelationRepository: RolePermissionRelationRepository,
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

  protected modelView(view: string): void {
    const compareView = this.getView();
    if (view === compareView[VIEW.ROLE]) {
      this.model = this.roleRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }

  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.USER_ROLE, [
      {
        model: this.roleRepository.getModel(),
        as: 'roles',
        through: {
          attributes: [], // without pivot table
          as: this.getUserRoleRelationTableName(),
        },
        where: {
          type: RoleTypeEnum.User,
        },
        include: [
          {
            model: this.permissionRepository.getModel(),
            as: 'permissions',
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
  protected setupAssociation(): void {
    const relationConfigList = new RelationConfigList();
    relationConfigList.add((relation: RelationConfig) => {
      relation.setRelation(RELATION.BELONGS_TO_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.roleRepository.getModel());
      relation.setBinding({
        primary: {
          through: this.getUserRoleRelationTableName(),
          as: 'roles',
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

    this.setRelation(...relationConfigList.toArray());
  }
}
