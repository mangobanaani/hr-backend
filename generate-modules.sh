#!/bin/bash

# HR System Module Generator Script
# This script creates basic module structures for all HR system components

MODULES=(
  "benefits"
  "companies" 
  "performance"
  "training"
  "time-tracking"
  "expenses" 
  "documents"
  "projects"
  "policies"
  "announcements"
)

BASE_DIR="/Users/pekka/Documents/hr/hr-system-backend/src"

for module in "${MODULES[@]}"; do
  echo "Creating module: $module"
  
  # Create directories
  mkdir -p "$BASE_DIR/$module/dto"
  
  # Create basic controller
  cat > "$BASE_DIR/$module/${module}.controller.ts" << EOF
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('$module')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('$module')
export class ${module^}Controller {
  @Post()
  @ApiOperation({
    summary: 'Create ${module}',
    description: 'Create a new ${module} record',
  })
  @ApiResponse({
    status: 201,
    description: '${module^} created successfully',
  })
  create(@Body() _data: any): { message: string } {
    return { message: '${module^} creation endpoint - to be implemented' };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ${module}',
    description: 'Retrieve a list of all ${module}',
  })
  @ApiResponse({
    status: 200,
    description: 'List of ${module} retrieved successfully',
  })
  findAll(): { message: string } {
    return { message: '${module^} list endpoint - to be implemented' };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ${module} by ID',
    description: 'Retrieve a specific ${module} by ID',
  })
  @ApiParam({
    name: 'id',
    description: '${module^} ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '${module^} retrieved successfully',
  })
  findOne(@Param('id') id: string): { message: string } {
    return { message: \`\${module^} \${id} details - to be implemented\` };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ${module}',
    description: 'Update an existing ${module}',
  })
  @ApiParam({
    name: 'id',
    description: '${module^} ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '${module^} updated successfully',
  })
  update(@Param('id') id: string, @Body() _data: any): { message: string } {
    return { message: \`\${module^} \${id} update - to be implemented\` };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete ${module}',
    description: 'Delete a ${module} from the system',
  })
  @ApiParam({
    name: 'id',
    description: '${module^} ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: '${module^} deleted successfully',
  })
  remove(@Param('id') id: string): { message: string } {
    return { message: \`\${module^} \${id} deletion - to be implemented\` };
  }
}
EOF

  # Create basic module
  cat > "$BASE_DIR/$module/${module}.module.ts" << EOF
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ${module^}Controller } from './${module}.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [${module^}Controller],
  providers: [],
  exports: [],
})
export class ${module^}Module {}
EOF

done

echo "All modules created successfully!"
echo "Don't forget to add them to the main app.module.ts file!"
