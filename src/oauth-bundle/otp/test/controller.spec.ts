

import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { RDSModule } from 'artifacts/rds/rds.module';
import configuration from 'src/config/configuration';
import { OtpSearchDTO } from '../dto/search.dto';
import { OtpController } from '../controller';
import { OtpService } from '../service';

describe('OtpController', () => {
  let app: TestingModule;
  let otpController: OtpController;
  let otpService: OtpService;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        RDSModule,
        ConfigModule.forRoot({
          load: [configuration],
          isGlobal: true,
        }),
      ],
      controllers: [OtpController],
      providers: [OtpService],
    }).compile();

    otpController = app.get<OtpController>(OtpController);
    otpService = app.get<OtpService>(OtpService);

    await app.init();
  });

  describe('search', () => {
    it('should return a response DTO', async () => {
      // jest.spyOn(otpService, 'search').mockImplementation(async () => result);
      // console.log('result', result.data);
    });
  });

  afterEach(async () => await app.close());
});
