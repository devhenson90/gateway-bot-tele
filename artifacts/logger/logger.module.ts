import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggerInterceptor } from './http/http.interceptor';

const isCloudRunning = process?.env?.AWS_EXECUTION_ENV !== undefined;

if (isCloudRunning) {
  const env: any = process.env;
  env.NO_COLOR = true;
}

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggerInterceptor,
    },
  ],
})
export class LoggerModule {}
