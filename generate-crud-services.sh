#!/bin/bash

# CRUD Service Generator for HR System
# This script generates complete CRUD services for all HR modules following NestJS best practices

BASE_DIR="/Users/pekka/Documents/hr/hr-system-backend/src"

# Array of modules that need CRUD services
MODULES=(
  "employees"
  "departments" 
  "benefits"
  "performance"
  "training"
  "time-tracking"
  "expenses"
  "projects"
  "companies"
  "documents"
  "policies"
  "announcements"
)

# Function to create DTOs for a module
create_dtos() {
  local module=$1
  local module_cap=$(echo "$module" | sed 's/-/_/g' | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  
  echo "Creating DTOs for $module..."
  
  # Create DTOs directory if it doesn't exist
  mkdir -p "$BASE_DIR/$module/dto"
  
  # Create Create DTO
  cat > "$BASE_DIR/$module/dto/create-${module}.dto.ts" << EOF
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Create${module_cap}Dto {
  @ApiProperty({
    description: '${module_cap} name',
    example: 'Sample ${module_cap}',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: '${module_cap} description',
    example: 'Description for ${module_cap}',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
EOF

  # Create Update DTO
  cat > "$BASE_DIR/$module/dto/update-${module}.dto.ts" << EOF
import { PartialType } from '@nestjs/swagger';
import { Create${module_cap}Dto } from './create-${module}.dto';

export class Update${module_cap}Dto extends PartialType(Create${module_cap}Dto) {}
EOF
}

# Function to create service for a module
create_service() {
  local module=$1
  local module_cap=$(echo "$module" | sed 's/-/_/g' | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  local prisma_model=$(echo "$module_cap" | sed 's/_//g')
  
  echo "Creating service for $module..."
  
  cat > "$BASE_DIR/$module/${module}.service.ts" << EOF
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Create${module_cap}Dto } from './dto/create-${module}.dto';
import { Update${module_cap}Dto } from './dto/update-${module}.dto';

@Injectable()
export class ${module_cap}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(create${module_cap}Dto: Create${module_cap}Dto): Promise<any> {
    try {
      return await this.prisma.${prisma_model,,}.create({
        data: create${module_cap}Dto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('${module_cap} with this name already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<any[]> {
    return await this.prisma.${prisma_model,,}.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<any> {
    const ${module,,} = await this.prisma.${prisma_model,,}.findUnique({
      where: { id },
    });

    if (!${module,,}) {
      throw new NotFoundException(\`${module_cap} with ID \${id} not found\`);
    }

    return ${module,,};
  }

  async update(
    id: string,
    update${module_cap}Dto: Update${module_cap}Dto,
  ): Promise<any> {
    await this.findOne(id); // Verify record exists

    try {
      return await this.prisma.${prisma_model,,}.update({
        where: { id },
        data: update${module_cap}Dto,
      });
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('${module_cap} with this name already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<any> {
    await this.findOne(id); // Verify record exists

    return await this.prisma.${prisma_model,,}.delete({
      where: { id },
    });
  }
}
EOF
}

# Function to create controller for a module
create_controller() {
  local module=$1
  local module_cap=$(echo "$module" | sed 's/-/_/g' | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  
  echo "Creating controller for $module..."
  
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
import { ${module_cap}Service } from './${module}.service';
import { Create${module_cap}Dto } from './dto/create-${module}.dto';
import { Update${module_cap}Dto } from './dto/update-${module}.dto';

@ApiTags('${module}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('${module}')
export class ${module_cap}Controller {
  constructor(private readonly ${module,,}Service: ${module_cap}Service) {}

  @Post()
  @ApiOperation({
    summary: 'Create ${module,,}',
    description: 'Create a new ${module,,} record',
  })
  @ApiResponse({
    status: 201,
    description: '${module_cap} created successfully',
  })
  async create(@Body() create${module_cap}Dto: Create${module_cap}Dto): Promise<any> {
    return await this.${module,,}Service.create(create${module_cap}Dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all ${module,,}',
    description: 'Retrieve a list of all ${module,,} records',
  })
  @ApiResponse({
    status: 200,
    description: '${module_cap} list retrieved successfully',
  })
  async findAll(): Promise<any[]> {
    return await this.${module,,}Service.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ${module,,} by ID',
    description: 'Retrieve a specific ${module,,} record by ID',
  })
  @ApiParam({ name: 'id', description: '${module_cap} ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '${module_cap} retrieved successfully',
  })
  @ApiResponse({ status: 404, description: '${module_cap} not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return await this.${module,,}Service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update ${module,,}',
    description: 'Update a specific ${module,,} record by ID',
  })
  @ApiParam({ name: 'id', description: '${module_cap} ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '${module_cap} updated successfully',
  })
  @ApiResponse({ status: 404, description: '${module_cap} not found' })
  async update(
    @Param('id') id: string,
    @Body() update${module_cap}Dto: Update${module_cap}Dto,
  ): Promise<any> {
    return await this.${module,,}Service.update(id, update${module_cap}Dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete ${module,,}',
    description: 'Delete a specific ${module,,} record by ID',
  })
  @ApiParam({ name: 'id', description: '${module_cap} ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: '${module_cap} deleted successfully',
  })
  @ApiResponse({ status: 404, description: '${module_cap} not found' })
  async remove(@Param('id') id: string): Promise<any> {
    return await this.${module,,}Service.remove(id);
  }
}
EOF
}

# Function to update module to include service
update_module() {
  local module=$1
  local module_cap=$(echo "$module" | sed 's/-/_/g' | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}')
  
  echo "Updating module for $module..."
  
  cat > "$BASE_DIR/$module/${module}.module.ts" << EOF
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ${module_cap}Controller } from './${module}.controller';
import { ${module_cap}Service } from './${module}.service';

@Module({
  imports: [DatabaseModule],
  controllers: [${module_cap}Controller],
  providers: [${module_cap}Service],
  exports: [${module_cap}Service],
})
export class ${module_cap}Module {
  // ${module_cap} management module for HR system
}
EOF
}

# Main execution
echo "Starting CRUD generation for HR System modules..."

for module in "\${MODULES[@]}"; do
  echo ""
  echo "📁 Processing module: $module"
  
  # Skip if the module already has a service (like benefits)
  if [ -f "$BASE_DIR/$module/${module}.service.ts" ] && [ "$module" != "training" ]; then
    echo "   Service already exists, skipping $module"
    continue
  fi
  
  create_dtos "$module"
  create_service "$module" 
  create_controller "$module"
  update_module "$module"
  
  echo "   Completed $module"
done

echo ""
echo "🎉 CRUD generation completed for all modules!"
echo "💡 Next steps:"
echo "   1. Review the generated files"
echo "   2. Update Prisma model names if needed"
echo "   3. Add specific validation rules in DTOs"
echo "   4. Run 'npm run lint --fix' to fix formatting"
echo "   5. Test the endpoints with npm run start:dev"
