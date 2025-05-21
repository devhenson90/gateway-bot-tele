import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as _ from 'lodash';

export const whitelistPaths = [
  '/api/gateway/v1/jwt/oauth/password/ex-user-login',
  '/api/gateway/v1/authorization/jwt/auth/ex-user/refresh_token',
];

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);
  private static EXTERNAL_USER_KEY: string = 'x-signature';

  constructor() { }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const originalEnd = res.end;
    let responseBody: any;

    res.end = function (chunk: any, encoding?: any, cb?: () => void): Response<any, Record<string, any>> {
      if (chunk) responseBody = chunk.toString();
      return originalEnd.apply(res, [chunk, encoding, cb]);
    };

    res.on('finish', async () => {
      if (!this.isExternalUserOrWhitelistedPath(req)) {
        return;
      }
      const duration = Date.now() - start;
      this.saveLog(req, res.statusCode, responseBody, `${duration}ms`);
    });

    next();
  }

  isExternalUserOrWhitelistedPath(req: Request): boolean {
    return req.headers[LoggingMiddleware.EXTERNAL_USER_KEY] !== undefined || _.some(whitelistPaths, (whitelistedPath) => req.url.startsWith(whitelistedPath))
  }

  async saveLog(req: Request, resCode: number, resBody: any, duration: string) {
    try {
     
    } catch (error) {
      this.logger.error(error);
    }
  }
}
