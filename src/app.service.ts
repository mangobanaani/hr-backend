import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
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
    };
  }
}
