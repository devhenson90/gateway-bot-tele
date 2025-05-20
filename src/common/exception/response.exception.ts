import { HttpException, HttpStatus } from '@nestjs/common';

export interface ResponseExOptions {
  httpStatus: HttpStatus;
}

export class ResponseException extends HttpException {
  constructor(message: string | Error, options?: ResponseExOptions) {
    const httpStatus =
      options && options.httpStatus
        ? options.httpStatus
        : HttpStatus.BAD_REQUEST;
    super(message, httpStatus);
  }
}
