import { UpdateExpression } from './update-expression.model';

export class ExpressionDynamo extends UpdateExpression {
  private updateString = 'set ';
  private updateValue = {};
  private input: any;

  constructor(input: any) {
    super();
    this.input = input;
  }

  getUpdateExpression() {
    const flatObj = this.flatten(this.input);
    for (const [key, value] of Object.entries(flatObj)) {
      this.updateString += `${key} = :${key} `;
    }

    return this.updateString;
  }

  getListAppendExpression() {
    const flatObj = this.flatten(this.input);
    for (const [key, value] of Object.entries(flatObj)) {
      this.updateString += `${key} = list_append(if_not_exists(${key}, :empty_list), :${key})`;
    }

    return this.updateString;
  }

  getListExpressionAttribute() {
    const flatObj = this.flatten(this.input);
    for (const [key, value] of Object.entries(flatObj)) {
      if(key === 'data'){
        this.updateString += `#${key} = list_append(if_not_exists(#${key}, :empty_list), :${key}) `;
      }else{
        this.updateString += `, #${key} = :${key}`;
      }
      
    }

    return this.updateString;
  }

  getListExpressionIndex() {
    const flatObj = this.flatten(this.input);
    let valueExpressionIndex = 'SET '
    for (const [key, value] of Object.entries(flatObj)) {
      if(key === 'data'){
        valueExpressionIndex += `#${key} = :${key}`;
      }else{
        valueExpressionIndex += `, #${key} = :${key}`;
      }
      
    }

    return valueExpressionIndex
  }

  getConditionExpressionIndex(){
    const flatObj = this.flatten(this.input);

    let valueCondition = '';
    for (const [key, value] of Object.entries(flatObj)) {
      if (Array.isArray(value)) {
          for (let item of value) {
              if (item.message_id) {
                  valueCondition += `#message_id = :message_id`;
              }
          }
      }
    }

    return valueCondition;
  }

  getExpressionAttributeValues(): any {
    const flatObj = this.flatten(this.input);
    for (const [key, value] of Object.entries(flatObj)) {
      this.updateValue[`:${key}`] = value;
    }

    return this.updateValue;
  }

  getListAppendExpressionAttributeValues(): any {
    const flatObj = this.flatten(this.input);
    for (const [key, value] of Object.entries(flatObj)) {
      this.updateValue[`:${key}`] = value;
    }

    return { ...this.updateValue, ":empty_list": [] };
  }

  flatten(input: any) {
    const result = {};
    for (const i in input) {
      if (typeof input[i] === 'object' && !Array.isArray(input[i])) {
        const temp = this.flatten(input[i]);
        for (const j in temp) {
          result[i + '.' + j] = temp[j];
        }
      } else {
        result[i] = input[i];
      }
    }
    return result;
  }
}
