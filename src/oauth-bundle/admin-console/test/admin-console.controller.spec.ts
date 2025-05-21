import { Test, TestingModule } from '@nestjs/testing';
import { AdminConsoleController } from '../admin-console.controller';
import { AdminConsoleService } from '../admin-console.service';

describe('AdminConsoleController', () => {
  let adminConsoleController: AdminConsoleController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AdminConsoleController],
      providers: [AdminConsoleService],
    }).compile();

    adminConsoleController = app.get<AdminConsoleController>(AdminConsoleController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(adminConsoleController.getHello()).toBe('Hello World!');
    });
  });
});
