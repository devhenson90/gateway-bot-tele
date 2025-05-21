import { Test, TestingModule } from '@nestjs/testing';
import { ScopeMasterController } from '../scope-master.controller';
import { ScopeMasterService } from '../scope-master.service';

describe('ScopeMasterController', () => {
  let scopeMasterController: ScopeMasterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ScopeMasterController],
      providers: [ScopeMasterService],
    }).compile();

    scopeMasterController = app.get<ScopeMasterController>(
      ScopeMasterController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(scopeMasterController.getHello()).toBe('Hello World!');
    });
  });
});
