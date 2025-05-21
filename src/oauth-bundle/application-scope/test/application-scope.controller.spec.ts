import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationScopeController } from '../application-scope.controller';
import { ApplicationScopeService } from '../application-scope.service';

describe('ApplicationScopeController', () => {
  let applicationScopeController: ApplicationScopeController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationScopeController],
      providers: [ApplicationScopeService],
    }).compile();

    applicationScopeController = app.get<ApplicationScopeController>(
      ApplicationScopeController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      // expect(applicationScopeController.getHello()).toBe('Hello World!');
    });
  });
});
