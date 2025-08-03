import { Test, type TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return application information', () => {
      const result = appController.getHello();
      expect(result).toEqual({
        name: 'HR System API',
        version: '1.0.0',
        description: 'RESTful API for Human Resources Management System',
        documentation: '/api/docs',
        status: 'running',
        endpoints: {
          authentication: '/auth',
          employees: '/employees',
          departments: '/departments',
          performance: '/performance',
        },
      });
    });
  });
});
