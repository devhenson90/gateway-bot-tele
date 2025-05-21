

import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { CanActivate, INestApplication } from '@nestjs/common';
import { JWTAuthGuard } from 'artifacts/auth/jwt/jwt.auth.guard';
import { RDSModule } from 'artifacts/rds/rds.module';
import { ConfigModule } from '@nestjs/config';
import configuration from 'src/config/configuration';
import { OtpController } from '../controller';
import { OtpService } from '../service';

describe('Otps', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mockGuard: CanActivate = { canActivate: jest.fn(() => true) };
    const moduleRef = await Test.createTestingModule({
      imports: [
        RDSModule,
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      controllers: [OtpController],
      providers: [OtpService],
    })
      .overrideGuard(JWTAuthGuard)
      .useValue(mockGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET otp`, () => {
    return request(app.getHttpServer()).get('/v1/otp').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
