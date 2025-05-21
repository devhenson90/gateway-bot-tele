import { ClsServiceManager, UseCls } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

const CLS = ClsServiceManager.getClsService();

export function UseClsContext<TArgs extends any[]>(): (
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<any>>,
) => void {
  return UseCls({
    generateId: true,
    idGenerator: () => uuidv4(),
  });
}

export enum CLS_KEY {
  RDS_INCLUDE_OPTIONS = 'rds.include-options',
  RDS_MODEL = 'rds.model',
  REQ_USER = 'req.user',
}

export interface ClsFindOptions {
  uuid?: string;
  key: CLS_KEY;
  className?: string;
}

export class ClsClient {
  private readonly debugPrint = (func: () => string) => false;

  private getKey(options: ClsFindOptions) {
    return options.uuid + '.' + options.key;
  }

  isActive() {
    return CLS.isActive();
  }

  getId() {
    return CLS.getId();
  }

  get(options: ClsFindOptions, defaultValue?: any): any {
    if (!this.isActive()) {
      return null;
    }

    if (defaultValue !== undefined && !CLS.has(this.getKey(options))) {
      this.set(options, defaultValue);
    }

    const data = CLS.get(this.getKey(options));
    this.debugPrint(
      () =>
        `get [req: ${this.getId()}] [repo: ${this.getKey(options)}] ${
          options.className
        } ${JSON.stringify(data) ?? typeof data}`,
    );

    return data;
  }

  set(options: ClsFindOptions, value: any): boolean {
    if (!this.isActive()) {
      return false;
    }

    CLS.set(this.getKey(options), value);
    this.debugPrint(
      () =>
        `set [req: ${this.getId()}] [repo: ${this.getKey(options)}] ${
          options.className
        } ${JSON.stringify(value) ?? typeof value}`,
    );
    return true;
  }
}
