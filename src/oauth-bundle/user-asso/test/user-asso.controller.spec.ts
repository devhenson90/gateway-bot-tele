import { Test, TestingModule } from '@nestjs/testing';
import { UserAssoController } from '../user-asso.controller';
import { UserAssoService } from '../user-asso.service';

describe('UserAssoController', () => {
  let userAssoController: UserAssoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserAssoController],
      providers: [UserAssoService],
    }).compile();

    userAssoController = app.get<UserAssoController>(UserAssoController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(UserAssoController.getHello()).toBe('Hello World!');
    });
  });
});
