import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { NestLogger } from 'artifacts/logger/core/nest.logger';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new NestLogger()
  });
  const MicroservicePort = process.env.MICROSERVICE_PORT
    ? process.env.MICROSERVICE_PORT
    : 4200;

  app.connectMicroservice({
    transport: Transport.TCP,
    options: { port: MicroservicePort, retryAttempts: 5, retryDelay: 3000 },
  });

  const moduleRoutingPath = `/${process.env.CORE}`;
  app.setGlobalPrefix('api' + moduleRoutingPath);

  app.use(`/api${moduleRoutingPath}/stripe/webhook`, express.raw({ type: 'application/json' }));

  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.use(cookieParser());
  console.log("process.env.PORT", process.env.PORT)
  const port = parseInt(process.env.CORE_PORT, 10) || 4002;
  await app.startAllMicroservices();
  await app.listen(port);
}
bootstrap();
