import { Sequelize, QueryTypes, Utils, ModelStatic, Model } from 'sequelize';
import { RDSService } from '../rds.service';
import * as _ from 'lodash';

export abstract class BaseSqlRepository {
  private readonly sequelize: Sequelize;
  private readonly queryGenerator: any;

  constructor(private readonly rds: RDSService) {
    this.sequelize = this.rds.getRDSClient().getSequelize() as any;
    this.queryGenerator = this.sequelize.getQueryInterface().queryGenerator;
  }

  format(sql, replacements): string {
    return sql.replace(/:+(?!\d)(\w+)/g, (value, key) => {
      if ('postgres' === this.rds.getDialect() && '::' === value.slice(0, 2)) {
        return value;
      }

      if (replacements[key] !== undefined) {
        return this.escape(replacements[key]);
      }
      throw new Error(
        `Named parameter "${value}" has no value in the given object.`,
      );
    });
  }

  escape(value: string | number | Date): string {
    if (_.isArray(value)) {
      return _.chain(value)
        .map((v) => this.rds.escape(v))
        .join(',')
        .value();
    }
    return this.rds.escape(value);
  }

  whereSql(model: ModelStatic<Model<any, any>>, conditions: any) {
    const where = Utils.mapWhereFieldNames(conditions, model);
    let sql = this.queryGenerator.selectQuery(
      model.getTableName(),
      {
        where,
      },
      model,
    );
    const whereTarget = ' WHERE ';
    const whereTargetIdx = sql.indexOf(whereTarget);
    if (whereTargetIdx === -1) {
      throw new Error(
        'Cannot convert where condition, please check sequelize version',
      );
    }
    return sql
      .substring(sql.indexOf(whereTarget) + whereTarget.length)
      .replace(/;/g, '');
  }

  select(sql, replacements = {}) {
    return this.sequelize.query(sql, {
      type: QueryTypes.SELECT,
      replacements,
    });
  }
  
  columnIdentifier(input: string) {
    const match = input.match(/^"(.+)"."(.+)"$/);
    if (match) {
      const part1 = match[1];
      const part2 = match[2];
      return (
        this.queryGenerator.quoteIdentifier(part1) +
        '.' +
        this.queryGenerator.quoteIdentifier(part2)
      );
    } else {
      return this.queryGenerator.quoteIdentifier(input);
    }
  }
}
