import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationAssoController } from '../application-asso.controller';
import { ApplicationAssoService } from '../application-asso.service';

describe('ApplicationAssoController', () => {
  let applicationAssoController: ApplicationAssoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationAssoController],
      providers: [ApplicationAssoService],
    }).compile();

    applicationAssoController = app.get<ApplicationAssoController>(ApplicationAssoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(ApplicationAssoController.getHello()).toBe('Hello World!');
    });
  });
});
