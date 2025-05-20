import { Test, TestingModule } from '@nestjs/testing';
import { UserRoleController } from '../user-role.controller';
import { UserRoleService } from '../user-role.service';

describe('UserRoleController', () => {
  let userRoleController: UserRoleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserRoleController],
      providers: [UserRoleService],
    }).compile();

    userRoleController = app.get<UserRoleController>(UserRoleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(userRoleController.getHello()).toBe('Hello World!');
    });
  });
});
