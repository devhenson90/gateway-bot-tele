import { Test, TestingModule } from '@nestjs/testing';
import { UserAppCredentialController } from '../user-app-credential.controller';
import { UserAppCredentialService } from '../user-app-credential.service';

describe('UserController', () => {
  let userController: UserAppCredentialController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserAppCredentialController],
      providers: [UserAppCredentialService],
    }).compile();

    userController = app.get<UserAppCredentialController>(UserAppCredentialController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(userController.getHello()).toBe('Hello World!');
    });
  });
});
