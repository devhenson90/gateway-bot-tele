import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingConfirmInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ConfirmInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const { method, originalUrl, body, query, params, headers } = req;

    const origin = headers['origin'] || 'unknown';
    const clientIp = req.ip || req.connection?.remoteAddress || 'unknown';

    const requestInfo = {
      method,
      url: originalUrl,
      body,
      query,
      params,
      origin,
      clientIp,
    };

    this.logger.log(`Request: ${JSON.stringify(requestInfo)}`);

    const now = Date.now();

    return next.handle().pipe(
      tap((responseData) => {
        const timeTaken = Date.now() - now;
        this.logger.log(
          `Response: ${JSON.stringify(responseData)} | ${timeTaken}ms`,
        );
      }),
    );
  }
}
