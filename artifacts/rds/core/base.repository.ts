import { Logger, OnModuleInit } from '@nestjs/common';
import { CLS_KEY, ClsClient, ClsFindOptions } from 'artifacts/cls/cls.client';
import { Model, ModelStatic, Op, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { computeDeltaArray } from './common/helpers/helper';

export abstract class BaseRepository implements OnModuleInit {
  protected uuid: string = uuidv4();
  protected cls = new ClsClient();
  protected className = this.constructor['name'];
  private _model: ModelStatic<Model>;
  private _includeOptions = {};

  private getClsFindOption(key: CLS_KEY): ClsFindOptions {
    return {
      uuid: this.uuid,
      className: this.className,
      key,
    };
  }

  get includeOptions(): any {
    return (
      this.cls.get(this.getClsFindOption(CLS_KEY.RDS_INCLUDE_OPTIONS), {}) ??
      this._includeOptions
    );
  }

  set includeOptions(value) {
    const isSet = this.cls.set(
      this.getClsFindOption(CLS_KEY.RDS_INCLUDE_OPTIONS),
      value,
    );
    if (!isSet) {
      this._includeOptions = value;
    }
  }

  get model(): ModelStatic<Model> {
    return (
      this.cls.get(this.getClsFindOption(CLS_KEY.RDS_MODEL)) ?? this._model
    );
  }

  set model(model: ModelStatic<Model>) {
    const isSet = this.cls.set(this.getClsFindOption(CLS_KEY.RDS_MODEL), model);
    if (!isSet) {
      this._model = model;
    }
  }

  setSchema(schema?: string) {
    const schemaModel = this._model.schema(schema);
    this.model = schemaModel;
  }

  /**
   * TODO
   * Need more factory pattern to be wrap sequelize functions
   */
  protected abstract init(): ModelStatic<Model>;
  protected abstract init(schema?: string): ModelStatic<Model>;

  abstract getIdentifierName(): string;
  abstract getRelationIdName(): string;

  getModel(): ModelStatic<Model> {
    return this.model;
  }

  reinit(schema?: string): ModelStatic<Model> {
    return this.init(schema);
  }

  private constructAttrOptions(attrOptions?: any) {
    if (!attrOptions) {
      attrOptions = {};
    }
    if (attrOptions.where) {
      this.where(attrOptions.where);
    }
    if (this.includeOptions) {
      attrOptions = { ...attrOptions, ...this.includeOptions };
    }
    return attrOptions;
  }

  setAttributes(field: string[]): any {
    if (!this.includeOptions['attributes']) {
      this.includeOptions['attributes'] = [];
    }
    let attributes = this.includeOptions['attributes'];
    attributes = [...attributes, ...field]
    this.includeOptions['attributes'] = attributes;
    return this;
  }

  findAll(attributes?: any): Promise<Model[]> {
    attributes = this.constructAttrOptions(attributes);
    const promise = this.model.findAll(attributes);
    this.clearIncludeOptions();
    return promise;
  }

  findAndCountAll(
    attributes?: any,
  ): Promise<{ rows: Model<any, any>[]; count: number }> {
    attributes = this.constructAttrOptions(attributes);
    const promise = this.model.findAndCountAll(attributes);
    this.clearIncludeOptions();
    return promise;
  }

  findOne(where?: any): Promise<Model> {
    where = this.constructAttrOptions(where);
    const promise = this.model.findOne(where);
    this.clearIncludeOptions();
    return promise;
  }

  async findAllWithCallback(
    attributes: any,
    callback: (models: Model[]) => any,
  ) {
    // return this.model.findAll(attributes);
    try {
      const data = await this.model.findAll(attributes);
      callback(data);
    } catch (err) {
      Logger.error(err, err.stack, BaseRepository.name);
    }
  }

  insert(data: any, fields?: any): Promise<void | Model> {
    fields = this.constructAttrOptions(fields);
    const promise = this.model.create(data, fields);
    this.clearIncludeOptions();
    return promise;
  }

  bulkInsert(data: any[], fields?: any): Promise<Array<Model>> {
    return this.model.bulkCreate(data, fields);
  }

  async replaceDeltaArray(sources, updates, options: {
    ignoreUpdated?: boolean,
    keyFunc?: Function,
  } = {}): Promise<void> {
    if (updates === undefined || updates === null) {
      return;
    }
    let localKeyFunc: any = (item) => item.id;
    if (options?.keyFunc) {
      localKeyFunc = options.keyFunc;
    }

    const delta = computeDeltaArray(localKeyFunc, sources, updates);

    for (const sourceItem of delta.deleted) {
      await sourceItem.destroy();
    }

    if (!options.ignoreUpdated) {
      for (const [sourceItem, toUpdateItem] of delta.changed) {
        delete toUpdateItem.id;
        await sourceItem.update(toUpdateItem);
      }
    }

    for (const updatedItem of delta.added) {
      delete updatedItem.id;
      await this.model.create(updatedItem)
    }
  }

  update(data: any, where: any): Promise<[number, Model[]]> {
    return this.model.update(data, where);
  }

  upsert(data: any, where: any): Promise<[Model, boolean]> {
    return this.model.upsert(data, where);
  }

  delete(where?: any): Promise<number> {
    where = this.constructAttrOptions(where);
    const promise = this.model.destroy(where);
    this.clearIncludeOptions();
    return promise;
  }

  protected insertAndUpdate(
    insertData: any,
    fields: any,
    updateData: any,
    where: any,
  ) {
    this.insert(insertData, fields);
    this.update(updateData, where);
  }

  protected findAllAndUpdate(attributes: any, updateData: any, where: any) {
    this.findAll(attributes);
    this.update(updateData, where);
  }

  count(where?: any): Promise<any> {
    where = this.constructAttrOptions(where);
    const promise = this.model.count(where);
    this.clearIncludeOptions();
    return promise;
  }

  where(dto: any, identifier?: string): BaseRepository {
    if (!dto) {
      return this;
    }
    if (!this.includeOptions['where']) {
      this.includeOptions['where'] = {};
    }
    if (identifier) {
      this.includeOptions['where'][identifier] = dto[identifier];
    } else {
      for (const identifier of Object.keys(dto)) {
        this.includeOptions['where'][identifier] = dto[identifier];
      }
    }
    return this;
  }

  whereExpression(dto: any, identifier?: string): BaseRepository {
    if (!dto) return this;
    if (!this.includeOptions.where) {
      this.includeOptions.where = {};
    }

    if (identifier) {
      this.includeOptions.where[identifier] = dto[identifier];
    } else {
      for (const key of [...Object.keys(dto), ...Object.getOwnPropertySymbols(dto)]) {
        this.includeOptions.where[key] = dto[key];
      }
    }

    return this;
  }

  or(dto: Array<any>): BaseRepository {
    if (!dto) {
      return this;
    }
    if (!this.includeOptions['where']) {
      this.includeOptions['where'] = {};
    }
    this.includeOptions['where'][Op.or] = dto;
    return this;
  }

  and(dto: Array<any>): BaseRepository {
    if (!dto) {
      return this;
    }
    if (!this.includeOptions['where']) {
      this.includeOptions['where'] = {};
    }
    this.includeOptions['where'][Op.and] = dto;
    return this;
  }

  order(
    field: string,
    type: string,
    model?: ModelStatic<Model>,
  ): BaseRepository {
    if (model) {
      this.includeOptions['order'] = [[model, field, type]];
    } else {
      this.includeOptions['order'] = [[field, type]];
    }
    return this;
  }

  limit(limit: number): BaseRepository {
    this.includeOptions['limit'] = limit;
    return this;
  }

  page(page: number, limit = 20): BaseRepository {
    if (!this.includeOptions['limit']) {
      this.includeOptions['limit'] = limit;
    }
    limit = this.includeOptions['limit'];
    this.includeOptions['offset'] = (page - 1) * limit;
    return this;
  }

  distinct(field: string, display: string): BaseRepository {
    if (!this.includeOptions['attributes']) {
      this.includeOptions['attributes'] = [];
    }
    const attributes = this.includeOptions['attributes'];
    attributes.push([Sequelize.fn('distinct', Sequelize.col(field)), display]);
    this.includeOptions['attributes'] = attributes;
    return this;
  }

  field(field: string, display?: string): any {
    if (!this.includeOptions['attributes']) {
      this.includeOptions['attributes'] = [];
    }
    const attributes = this.includeOptions['attributes'];
    if (display) {
      attributes.push([field, display]);
    } else {
      attributes.push([field, field]);
    }
    this.includeOptions['attributes'] = attributes;
    return this;
  }

  jsonField(field: string, display: string): any {
    if (!this.includeOptions['attributes']) {
      this.includeOptions['attributes'] = [];
    }
    const attributes = this.includeOptions['attributes'];
    attributes.push([Sequelize.json(field), display]);
    this.includeOptions['attributes'] = attributes;
    return this;
  }

  group(field: string, isJson?: true): any {
    if (!this.includeOptions['group']) {
      this.includeOptions['group'] = [];
    }
    const groups = this.includeOptions['group'];
    if (isJson) {
      groups.push(Sequelize.json(field));
    } else {
      groups.push(field);
    }
    this.includeOptions['group'] = groups;
    return this;
  }

  query(sql: any, queryOptions?: any): Promise<any> {
    const promise = this.model.sequelize.query(sql, queryOptions);
    return promise;
  }

  private clearIncludeOptions() {
    this.includeOptions = {};
  }

  onModuleInit() {
    this.init();
  }
}
