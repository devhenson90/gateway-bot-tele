import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { BaseRepository } from 'artifacts/rds/core/base.repository';
import { RelationRepository } from 'artifacts/rds/core/relation.repository';
import { Observable } from 'rxjs';

/**
 * Interceptor for select schema with dynamic request
 */
@Injectable()
export class RepositoryInterceptor<T extends BaseRepository> implements NestInterceptor {
  private readonly logger = new Logger(RepositoryInterceptor.name);
  private dependencies: (BaseRepository | RelationRepository)[];

  constructor(
    private repository: T,
    ...dependencies: (BaseRepository | RelationRepository)[]
  ) {
    this.dependencies = dependencies ?? [];
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const schema = request.headers['your_header_for_db_schema'];
    this.logger.log('RepositoryInterceptor schema', schema);

    this.setSchema(schema);

    /**
     * If you need dynamic schema selection,
     * consider using 'reinit' instead of 'setSchema'
     * to avoid maximum call stack errors when deep cloning.
     */
    // this.reinit(schema);
    return next.handle();
  }

  loopRepository(
    baseHook: (repo: BaseRepository) => void,
    relationHook: (repo: RelationRepository) => void,
  ) {
    baseHook(this.repository);
    for (const repo of this.dependencies) {
      if (repo instanceof RelationRepository) {
        relationHook(repo);
      } else {
        baseHook(repo);
      }
    }
  }

  setSchema(schema: string) {
    this.loopRepository(
      (repo) => repo.setSchema(schema),
      (repo) => repo.setSchemas(schema),
    );
  }

  reinit(schema: string) {
    this.loopRepository(
      (repo) => repo.reinit(schema),
      (repo) => repo.reinits(schema),
    );
  }
  
}

@Injectable()
export abstract class RelationRepositoryInterceptor<T extends RelationRepository>  implements NestInterceptor {
  private readonly logger = new Logger(RelationRepositoryInterceptor.name);

  constructor(private readonly repository: T) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const schema = request.headers['your_header_for_db_schema'];
    this.logger.log('RelationRepositoryInterceptor schema', schema);
    this.repository.setSchemas(schema);
    /**
     * If you need dynamic schema selection,
     * consider using 'reinit' instead of 'setSchema'
     * to avoid maximum call stack errors when deep cloning.
     */
    // this.repository.reinits(schema);
    return next.handle();
  }
}
