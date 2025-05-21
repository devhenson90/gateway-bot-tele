import { Injectable } from '@nestjs/common';
import { PermissionRepository } from 'src/oauth-bundle/permission/repositories/permission.repository';
import { RoleRepository } from 'src/oauth-bundle/role/repositories/role.repository';
import { RolePermissionRelationRepository } from './role-permission-relation.repository';
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

export enum VIEW {
  ROLE_PERMISSION = 'rp',
  PERMISSION_ROLE = 'pr',
}

@Injectable()
export class RolePermissionAssociationRepository extends RelationRepository {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly rolePermissionRelationRepository: RolePermissionRelationRepository,
  ) {
    super(new Map<string, BaseRepository>());
    for (let repo of arguments) {
      this.initAssociateRepository(repo);
    }
    this.setViews(VIEW);
  }

  getRoleRepository() {
    return this.roleRepository;
  }

  getPermissionRepository() {
    return this.permissionRepository;
  }

  getRolePermissionRelationRepository() {
    return this.rolePermissionRelationRepository;
  }

  getMainRepository(): BaseRepository {
    return this.getRoleRepository();
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
  protected modelView(view: string): void {
    const compareView = this.getView();
    if (view === compareView[VIEW.ROLE_PERMISSION]) {
      this.model = this.roleRepository.getModel();
    } else if (view === compareView[VIEW.PERMISSION_ROLE]) {
      this.model = this.permissionRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }
  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.ROLE_PERMISSION, [
      {
        model: this.permissionRepository.getModel(),
        as: 'permissions',
        through: {
          as: 'rolePermissionRelations',
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.PERMISSION_ROLE, [
      {
        model: this.roleRepository.getModel(),
        as: 'roles',
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

    this.setRelation(...relationConfigList.toArray());
  }
}
