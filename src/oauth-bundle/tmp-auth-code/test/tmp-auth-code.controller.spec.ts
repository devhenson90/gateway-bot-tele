import { Test, TestingModule } from '@nestjs/testing';
import { TMPAuthCodeController } from '../tmp-auth-code.controller';
import { TMPAuthCodeService } from '../tmp-auth-code.service';

describe('TMPAuthCodeController', () => {
  let tmpAuthCodeController: TMPAuthCodeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TMPAuthCodeController],
      providers: [TMPAuthCodeService],
    }).compile();

    tmpAuthCodeController = app.get<TMPAuthCodeController>(
      TMPAuthCodeController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(tmpAuthCodeController.getHello()).toBe('Hello World!');
    });
  });
});
