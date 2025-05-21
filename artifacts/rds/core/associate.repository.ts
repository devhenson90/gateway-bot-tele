import { OnApplicationBootstrap } from '@nestjs/common';
import { BaseRepository } from './base.repository';

enum VIEW {}

export abstract class AssociateRepository
  extends BaseRepository
  implements OnApplicationBootstrap
{
  protected associateFetch: Map<string, any>;
  abstract getRelationRepository(): BaseRepository;
  abstract getMainRepository(): BaseRepository;

  constructor(
    protected readonly associateRepositories: Map<string, BaseRepository>
  ) {
    super();
  }

  protected init() {
    return null;
  }

  /**
   * TODO
   * Need associateModels provide factory method for better usage
   */
  protected abstract modelView(view: string): void
  protected abstract setupAssociation(): void;

  getRepository(name: string): BaseRepository {
    return this.associateRepositories.get(name);
  }

  getRepositoryClass(type: any): BaseRepository {
    for (let [name, repository] of this.associateRepositories) {
      if (repository instanceof type) {
        return repository;   
      }
    }
  }

  getRepositories(): BaseRepository[] {
    const repositories: BaseRepository[] = [];
    for (let [name, repository] of this.associateRepositories) {
      repositories.push(repository);
    }
    return repositories;
  }

  protected setView(key: string, view: string): void {
    VIEW[key] = view;
  }

  protected setViews(views: any): void {
    const viewStrings: string[] = Object.values(views);
    for (const view of viewStrings) {
      VIEW[view] = view;
    }
  }

  getView() {
    return VIEW;
  }
  
  include(key: string): AssociateRepository {
    this.includeOptions['include'] = this.associateFetch.get(key);
    return this;
  }

  onModuleInit() {
    super.onModuleInit();
    this.associateFetch = new Map<string, any>();
  }

  onApplicationBootstrap() {
    this.setupAssociation();
  }
}
