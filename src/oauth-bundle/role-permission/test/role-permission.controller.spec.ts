import { Test, TestingModule } from '@nestjs/testing';
import { RolePermissionController } from '../role-permission.controller';
import { RolePermissionService } from '../role-permission.service';

describe('RolePermissionController', () => {
  let rolePermissionController: RolePermissionController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [RolePermissionController],
      providers: [RolePermissionService],
    }).compile();

    rolePermissionController = app.get<RolePermissionController>(
      RolePermissionController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(rolePermissionController.getHello()).toBe('Hello World!');
    });
  });
});
