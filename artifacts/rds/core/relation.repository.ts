import { AssociateRepository } from 'artifacts/rds/core/associate.repository';
import { BaseRepository } from './base.repository';
import { AssociationConfig, RelationConfig } from './config/relation.config';

export enum RELATION {
  HAS_ONE = 'has-one',
  HAS_MANY = 'has-many',
  BELONGS_TO = 'belongs-to',
  BELONGS_TO_MANY = 'belongs-to-many',
}

export abstract class RelationRepository extends AssociateRepository {
  protected abstract getRelationTableName(): string;
  protected abstract setupAssociationConfig(): AssociationConfig[];

  constructor(
    protected readonly associateRepositories: Map<string, BaseRepository>,
  ) {
    super(associateRepositories);
  }

  protected initAssociateRepository(repository: BaseRepository): void {
    this.associateRepositories.set(repository.getIdentifierName(), repository);
  }

  // Override include method for model selection;
  include(view: string): AssociateRepository {
    this.modelView(view);
    return super.include(view);
  }

  setSchemas(schema: string) {
    this.associateRepositories.forEach((repository: BaseRepository, name: string) => {
      repository.setSchema(schema);
    });
    this.bindEagerLoading(...this.setupAssociationConfig());
  }

  reinits(schema: string) {
    this.associateRepositories.forEach((repository: BaseRepository, name: string) => {
      repository.reinit(schema);
    });
    this.setupAssociation();
  }

  protected setRelation(...configs: RelationConfig[]) {
    for (let config of configs) {
      switch (config.getRelation()) {
        case RELATION.HAS_ONE:
          config.getEntityModel().hasOne(
            config.getAssociateModel(), 
            config.getBinding());
          break;
        case RELATION.HAS_MANY:
          config.getEntityModel().hasMany(
            config.getAssociateModel(), 
            config.getBinding());
          break;
        case RELATION.BELONGS_TO:
          config.getEntityModel().belongsTo(
            config.getAssociateModel(), 
            config.getBinding());
          break;
        case RELATION.BELONGS_TO_MANY:
          config.getEntityModel().belongsToMany(
            config.getAssociateModel(),
            config.getBinding().primary);
          config.getAssociateModel().belongsToMany(
            config.getEntityModel(),
            config.getBinding().secondary);
          break;
      }
    }
    this.bindEagerLoading(...this.setupAssociationConfig());
  }

  protected bindEagerLoading(...associationConfigs: AssociationConfig[]) {
    for (let associationConfig of associationConfigs) {
      this.associateFetch.set(associationConfig.getView(), associationConfig.getInclude());
    }
  }
}
