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
import { Status } from 'src/common/enum/status.enum';
import { ScopeMasterRepository } from 'src/oauth-bundle/scope-master/repositories/scope-master.repository';
import { TMPAuthCodeRepository } from 'src/oauth-bundle/tmp-auth-code/repositories/tmp-auth-code.repository';
import { UserRepository } from 'src/oauth-bundle/user/repositories/user.repository';
import { UserScopeRelationRepository } from './user-scope-relation.repository';

export enum VIEW {
  USER_SCOPE = 'user-scope',
  SCOPE_USER = 'scope-user',
  SCOPE_USER_GATEWAY = 'scope-user-gateway',
  USER_SCOPE_TMP_AUTH_CODE = 'user-scope-tmp-auth-code',
}

@Injectable()
export class UserScopeAssociationRepository extends RelationRepository {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly scopeMasterRepository: ScopeMasterRepository,
    private readonly userScopeRelationRepository: UserScopeRelationRepository,
    private readonly tmpAuthCodeRepository: TMPAuthCodeRepository,
  ) {
    super(new Map<string, BaseRepository>());
    for (let repo of arguments) {
      this.initAssociateRepository(repo);
    }
    this.setViews(VIEW);
  }

  getuserRepository() {
    return this.userRepository;
  }

  getScopeMasterRepository() {
    return this.scopeMasterRepository;
  }

  getUserScopeRelationRepository() {
    return this.userScopeRelationRepository;
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

  getUserScopeRelationTableName(): string {
    return 'user_scope_relations';
  }

  protected modelView(view: string): void {
    const compareView = this.getView();
    if (
      view === compareView[VIEW.USER_SCOPE] ||
      view === compareView[VIEW.USER_SCOPE_TMP_AUTH_CODE]
    ) {
      this.model = this.userRepository.getModel();
    } else if (view === compareView[VIEW.SCOPE_USER] || view === compareView[VIEW.SCOPE_USER_GATEWAY]) {
      this.model = this.scopeMasterRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }
  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.USER_SCOPE, [
      {
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
        through: {
          as: 'userScopeRelations',
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.SCOPE_USER, [
      {
        model: this.userRepository.getModel(),
        as: 'users',
        through: {
          as: 'userScopeRelations',
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.SCOPE_USER_GATEWAY, [
      {
        model: this.userRepository.getModel(),
        as: 'users',
        through: {
          as: 'userScopeRelations',
        },
        where: {
          status: {
            [Op.eq]: Status.Enable,
          }
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.USER_SCOPE_TMP_AUTH_CODE, [
      {
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
        through: {
          as: 'userScopeRelations',
        },
      },
      {
        model: this.tmpAuthCodeRepository.getModel(),
      },
    ]);
    return associationConfigList.toArray();
  }

  protected setupAssociation(): void {
    const relationConfigList = new RelationConfigList();
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
      relation.setRelation(RELATION.HAS_MANY);
      relation.setEntityModel(this.userRepository.getModel());
      relation.setAssociateModel(this.tmpAuthCodeRepository.getModel());
      relation.setBinding({
        foreignKey: 'userId',
        sourceKey: 'id',
      });
    });

    this.setRelation(...relationConfigList.toArray());
  }
}
