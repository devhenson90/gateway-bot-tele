import { Test, TestingModule } from '@nestjs/testing';
import { UserScopeController } from '../user-scope.controller';
import { UserScopeService } from '../user-scope.service';

describe('UserScopeController', () => {
  let userScopeController: UserScopeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserScopeController],
      providers: [UserScopeService],
    }).compile();

    userScopeController = app.get<UserScopeController>(UserScopeController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(userScopeController.getHello()).toBe('Hello World!');
    });
  });
});
