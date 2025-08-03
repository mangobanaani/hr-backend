import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Application')
@Controller({ path: '/' })
export class RootController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: 'Get application information',
    description: 'Returns basic information about the HR System API',
  })
  @ApiResponse({
    status: 200,
    description: 'Application information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'HR System API' },
        version: { type: 'string', example: '1.0.0' },
        description: {
          type: 'string',
          example: 'RESTful API for Human Resources Management System',
        },
        documentation: { type: 'string', example: '/api/docs' },
        status: { type: 'string', example: 'running' },
      },
    },
  })
  getRoot(): object {
    return this.appService.getHello();
  }
}
