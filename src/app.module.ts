import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from 'artifacts/auth/auth.module';
import { ClsAdapterModule } from 'artifacts/cls/cls.module';
import { LoggerModule } from 'artifacts/logger/logger.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import configuration from './config/configuration';
import { GlobalModule } from './global/global.module';
import { HealthModule } from './health/health.module';
import { BotTeleModule } from './bot-telegram/module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    GlobalModule,
    ClsAdapterModule,
    LoggerModule,
    HealthModule,
    AuthModule,
    BotTeleModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}