import { Sequelize, Model, ModelAttributes, ModelStatic } from 'sequelize';

export class RDSModelBuilder {
  private sequelize: Sequelize;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
  }

  define(
    modelName: string,
    modelAttr: ModelAttributes<any, any>,
    tableName: string,
    underscored = false,
    schema?: string,
  ): ModelStatic<Model> {
    return this.sequelize.define(modelName, modelAttr, {
      // Other model options go here
      tableName: tableName,
      timestamps: false,
      underscored: underscored,
      schema: schema,
    });
  }
}
