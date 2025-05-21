import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ValidationError } from 'sequelize';

function mapValidationErrorMessage(err: ValidationError) {
  const firstError = err.errors[0];
  if (!firstError) {
    return err.message
  }
  let msg = firstError.message;
  if (firstError.type === 'unique violation') {
    if (firstError.path.indexOf('username') !== -1) {
      return `Duplicate username`;
    } else if (firstError.path.indexOf('email') !== -1) {
      return `Duplicate email`;
    } else if (firstError.path.indexOf('phone') !== -1) {
      return `Duplicate phone`;
    }
  }
  return msg;
}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          if (err instanceof HttpException) {
            throw err;
          }
          let msg = err.message;
          if (err instanceof ValidationError) {
            msg = mapValidationErrorMessage(err);
          }

          const newError = new BadRequestException(msg);
          if (err?.stack) {
            newError.stack = err.stack;
          }
          throw newError;
        }),
      ),
    );
  }
}
