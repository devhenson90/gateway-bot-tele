import { Model, ModelStatic } from 'sequelize';
import { RELATION } from '../relation.repository';

export class RelationConfig {
  private relation: RELATION;
  private entityModel: ModelStatic<Model>;
  private associateModel: ModelStatic<Model>;
  private binding: any;
  private associationConfigs: AssociationConfig[];

  getRelation(): RELATION {
    return this.relation;
  }

  setRelation(value: RELATION): void {
    this.relation = value;
  }

  getEntityModel(): ModelStatic<Model> {
    return this.entityModel;
  }

  setEntityModel(value: any): void {
    this.entityModel = value;
  }

  getAssociateModel(): ModelStatic<Model> {
    return this.associateModel;
  }

  setAssociateModel(value: any): void {
    this.associateModel = value;
  }

  getBinding(): any {
    return this.binding;
  }

  setBinding(value: any): void {
    this.binding = value;
  }

  getAssociationConfigs(): AssociationConfig[] {
    return this.associationConfigs;
  }

  setAssociationConfigs(...value: AssociationConfig[]): void {
    this.associationConfigs = value;
  }
}

export class AssociationConfig {
  private view: string;
  private include: any[];

  getView(): string {
    return this.view;
  }

  setView(value: string): void {
    this.view = value;
  }

  getInclude(): any[] {
    return this.include;
  }

  setInclude(value: any[]): void {
    this.include = value;
  }
}

export class RelationConfigList {
  public readonly relationConfigs: RelationConfig[] = [];

  add(func: (relation: RelationConfig) => void) {
    const relation = new RelationConfig();
    func(relation);
    this.relationConfigs.push(relation);
  }

  toArray() {
    return this.relationConfigs;
  }
}

export class AssociationConfigList {
  public readonly associationConfigs: AssociationConfig[] = [];

  constructor(private readonly view: any) {}

  setInclude(view: string, include: any[]) {
    const association = new AssociationConfig();
    association.setView(this.view[view]);
    association.setInclude(include);
    this.associationConfigs.push(association);
  }

  toArray() {
    return this.associationConfigs;
  }
}
