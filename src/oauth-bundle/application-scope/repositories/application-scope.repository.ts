import { Injectable } from '@nestjs/common';
import { ApplicationRepository } from 'src/oauth-bundle/application/repositories/application.repository';
import { ScopeMasterRepository } from 'src/oauth-bundle/scope-master/repositories/scope-master.repository';
import { TMPAuthCodeRepository } from 'src/oauth-bundle/tmp-auth-code/repositories/tmp-auth-code.repository';
import { ApplicationScopeRelationRepository } from './application-scope-relation.repository';
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
  APPLICATION_SCOPE = 'app-scope',
  SCOPE_APPLICATION = 'scope-app',
  APPLICATION_SCOPE_TMP_AUTH_CODE = 'app-scope-tmp-auth-code',
}

@Injectable()
export class ApplicationScopeAssociationRepository extends RelationRepository {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly scopeMasterRepository: ScopeMasterRepository,
    private readonly applicationScopeRelationRepository: ApplicationScopeRelationRepository,
    private readonly tmpAuthCodeRepository: TMPAuthCodeRepository,
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
  protected modelView(view: string): void {
    const compareView = this.getView();
    if (view === compareView[VIEW.SCOPE_APPLICATION]) {
      this.model = this.scopeMasterRepository.getModel();
    } else {
      this.model = this.getMainRepository().getModel();
    }
  }

  protected setupAssociationConfig(): AssociationConfig[] {
    const associationConfigList = new AssociationConfigList(this.getView());
    associationConfigList.setInclude(VIEW.APPLICATION_SCOPE, [
      {
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
        through: {
          // attributes: [], // without pivot table
          as: 'applicationScopeRelations',
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.SCOPE_APPLICATION, [
      {
        model: this.applicationRepository.getModel(),
        as: 'applications',
        through: {
          // attributes: [], // without pivot table
          as: 'applicationScopeRelations',
        },
      },
    ]);

    associationConfigList.setInclude(VIEW.APPLICATION_SCOPE_TMP_AUTH_CODE, [
      {
        model: this.scopeMasterRepository.getModel(),
        as: 'scopes',
        through: {
          as: 'applicationScopeRelations',
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
      relation.setRelation(RELATION.HAS_MANY);
      relation.setEntityModel(this.applicationRepository.getModel());
      relation.setAssociateModel(this.tmpAuthCodeRepository.getModel());
      relation.setBinding({
        foreignKey: 'appId',
        sourceKey: 'id',
      });
    });

    this.setRelation(...relationConfigList.toArray());
  }
}
