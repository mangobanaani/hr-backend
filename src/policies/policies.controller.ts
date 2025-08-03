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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoliciesService } from './policies.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@ApiTags('policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new policy' })
  @ApiResponse({
    status: 201,
    description: 'The policy has been successfully created.',
  })
  create(@Body() createPolicyDto: CreatePolicyDto) {
    return this.policiesService.create(createPolicyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all policies' })
  @ApiResponse({ status: 200, description: 'Return all policies.' })
  findAll() {
    return this.policiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a policy by id' })
  @ApiResponse({ status: 200, description: 'Return the policy.' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a policy' })
  @ApiResponse({
    status: 200,
    description: 'The policy has been successfully updated.',
  })
  update(@Param('id') id: string, @Body() updatePolicyDto: UpdatePolicyDto) {
    return this.policiesService.update(id, updatePolicyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a policy' })
  @ApiResponse({
    status: 200,
    description: 'The policy has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }
}
