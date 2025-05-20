import * as _ from 'lodash';
import * as PostgresQueryGenerator from 'sequelize/lib/dialects/postgres/query-generator';

function customSelectQuery(
    tableName,
    options,
    model,
) {
    options = options || {};
    const limit = options.limit;
    const mainQueryItems = [];
    const subQueryItems = [];
    const joinFiltering = true;
    let joinFilteringIdx = 0;
    let joinFilteringOrders = [];
    const subQuery = false;
    const attributes = {
        main: options.attributes && options.attributes.slice(),
        subQuery: null
    };
    const mainTable = {
        name: tableName,
        quotedName: null,
        as: null,
        model
    };
    const topLevelInfo = {
        names: mainTable,
        options,
        subQuery
    };
    let mainJoinQueries = [];
    let subJoinQueries = [];
    let query;

    // Aliases can be passed through subqueries and we don't want to reset them
    if (this.options.minifyAliases && !options.aliasesMapping) {
        options.aliasesMapping = new Map();
        options.aliasesByTable = {};
        options.includeAliases = new Map();
    }

    // resolve table name options
    if (options.tableAs) {
        mainTable.as = this.quoteIdentifier(options.tableAs);
    } else if (!Array.isArray(mainTable.name) && mainTable.model) {
        mainTable.as = this.quoteIdentifier(mainTable.model.name);
    }

    mainTable.quotedName = !Array.isArray(mainTable.name) ? this.quoteTable(mainTable.name) : tableName.map(t => {
        return Array.isArray(t) ? this.quoteTable(t[0], t[1]) : this.quoteTable(t, true);
    }).join(', ');

    if (subQuery && attributes.main) {
        for (const keyAtt of mainTable.model.primaryKeyAttributes) {
            // Check if mainAttributes contain the primary key of the model either as a field or an aliased field
            if (!attributes.main.some(attr => keyAtt === attr || keyAtt === attr[0] || keyAtt === attr[1])) {
                attributes.main.push(mainTable.model.rawAttributes[keyAtt].field ? [keyAtt, mainTable.model.rawAttributes[keyAtt].field] : keyAtt);
            }
        }
    }

    attributes.main = this.escapeAttributes(attributes.main, options, mainTable.as);
    attributes.main = attributes.main || (options.include ? [`${mainTable.as}.*`] : ['*']);

    // If subquery, we add the mainAttributes to the subQuery and set the mainAttributes to select * from subquery
    if (subQuery || options.groupedLimit) {
        // We need primary keys
        attributes.subQuery = attributes.main;
        attributes.main = [`${mainTable.as || mainTable.quotedName}.*`];
    }

    if (options.include) {
        for (const include of options.include) {
            if (include.separate) {
                continue;
            }
            const joinQueries = this.generateInclude(include, { externalAs: mainTable.as, internalAs: mainTable.as }, topLevelInfo);

            subJoinQueries = subJoinQueries.concat(joinQueries.subQuery);
            mainJoinQueries = mainJoinQueries.concat(joinQueries.mainQuery);

            if (joinQueries.attributes.main.length > 0) {
                attributes.main = _.uniq(attributes.main.concat(joinQueries.attributes.main));
            }
            if (joinQueries.attributes.subQuery.length > 0) {
                attributes.subQuery = _.uniq(attributes.subQuery.concat(joinQueries.attributes.subQuery));
            }
        }
    }

    if (subQuery) {
        subQueryItems.push(this.selectFromTableFragment(options, mainTable.model, attributes.subQuery, mainTable.quotedName, mainTable.as));
        subQueryItems.push(subJoinQueries.join(''));
    } else {
        mainQueryItems.push(this.selectFromTableFragment(options, mainTable.model, attributes.main, mainTable.quotedName, mainTable.as));
        if (joinFiltering) {
            joinFilteringIdx = mainQueryItems.length;
        }

        mainQueryItems.push(mainJoinQueries.join(''));
    }

    // Add WHERE to sub or main query
    if (Object.prototype.hasOwnProperty.call(options, 'where') && !options.groupedLimit) {
        options.where = this.getWhereConditions(options.where, mainTable.as || tableName, model, options);
        if (options.where) {
            if (subQuery) {
                subQueryItems.push(` WHERE ${options.where}`);
            } else {
                mainQueryItems.push(` WHERE ${options.where}`);
                // Walk the main query to update all selects
                mainQueryItems.forEach((value, key) => {
                    if (value.startsWith('SELECT')) {
                        mainQueryItems[key] = this.selectFromTableFragment(options, model, attributes.main, mainTable.quotedName, mainTable.as, options.where);
                    }
                });
            }
        }
    }

    if (options.order) {
        const orders = this.getQueryOrders(options, model, subQuery);
        if (orders.mainQueryOrder.length) {
            if (joinFiltering) {
                joinFilteringOrders = orders.mainQueryOrder.map(
                    (val, idx) => `${val.replace(/asc/gi, '').replace(/desc/gi, '').trim()} ${this.getAliasToken()} calc_order_${idx}`
                );
            }
            mainQueryItems.push(` ORDER BY ${orders.mainQueryOrder.join(', ')}`);
        }
        if (orders.subQueryOrder.length) {
            subQueryItems.push(` ORDER BY ${orders.subQueryOrder.join(', ')}`);
        }
    }

    const limitOrder = this.addLimitAndOffset(options, mainTable.model);
    if (limitOrder && !options.groupedLimit) {
        if (subQuery) {
            subQueryItems.push(limitOrder);
        } else if (!joinFiltering) {
            mainQueryItems.push(limitOrder);
        }
    }

    if (subQuery) {
        this._throwOnEmptyAttributes(attributes.main, { modelName: model && model.name, as: mainTable.as });
        query = `SELECT ${attributes.main.join(', ')} FROM (${subQueryItems.join('')}) ${this.getAliasToken()} ${mainTable.as}${mainJoinQueries.join('')}${mainQueryItems.join('')}`;
    } else if (joinFiltering) {
        const joinFilteringLimit = limitOrder != null ? limitOrder : '';
        const joinFilteringPrimaryKeyAttr = `${mainTable.as}.${this.quoteIdentifier(model.primaryKeyField)}`;
        const joinFilterinBeforeQueryItems = mainQueryItems.slice(0, joinFilteringIdx);
        const joinFilteringAfterQueryItems = mainQueryItems.slice(joinFilteringIdx);
        const joinFilteringOrdersSql = joinFilteringOrders.join(', ');
        let innerAttr = `DISTINCT ${joinFilteringPrimaryKeyAttr} as calc_order_id`;
        if (joinFilteringOrdersSql !== '') {
            innerAttr += `, ${joinFilteringOrdersSql}`;
        }
        const innerQuery = `SELECT ${innerAttr} FROM ${this.quoteTable(model.getTableName())} ${this.getAliasToken()} ${mainTable.as}${joinFilteringAfterQueryItems.join('')}${joinFilteringLimit}`;
        const pagingJoin = ` INNER JOIN (${innerQuery}) AS "calc_paging" ON "calc_paging".calc_order_id = ${joinFilteringPrimaryKeyAttr}`;
        query = `${joinFilterinBeforeQueryItems.join('')}${pagingJoin}${joinFilteringAfterQueryItems.join('')}`;
    } else {
        query = mainQueryItems.join('');
    }

    return `${query};`;
}

export function PostgresQueryGeneratorPlugin() {
    const oldSelectQuery = PostgresQueryGenerator.prototype.selectQuery;
    PostgresQueryGenerator.prototype.selectQuery = function (
        tableName,
        options,
        model,
        ...args
    ) {
        const isJoinFiltering = !!options?.joinFiltering;
        if (!isJoinFiltering) {
            return oldSelectQuery.call(this, tableName, options, model, ...args);
        }

        return customSelectQuery.call(this, tableName, options, model, ...args);
    };
}
