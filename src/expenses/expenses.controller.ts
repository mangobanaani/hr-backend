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

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  @Post()
  @ApiOperation({
    summary: 'Create expense',
    description: 'Create a new expense report or reimbursement request',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
  })
  create(@Body() _data: Record<string, unknown>): { message: string } {
    return {
      message: 'Expense creation endpoint - to be implemented',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all expenses',
    description: 'Retrieve a list of all expense reports',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses list retrieved successfully',
  })
  findAll(): { message: string } {
    return {
      message: 'Expenses list endpoint - to be implemented',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get expense by ID',
    description: 'Retrieve a specific expense report by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense retrieved successfully',
  })
  findOne(@Param('id') id: string): { message: string } {
    return {
      message: `Expense ${id} details - to be implemented`,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update expense',
    description: 'Update an existing expense report',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense updated successfully',
  })
  update(
    @Param('id') id: string,
    @Body() _data: Record<string, unknown>,
  ): { message: string } {
    return {
      message: `Expense ${id} update - to be implemented`,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete expense',
    description: 'Delete an expense report from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense deleted successfully',
  })
  remove(@Param('id') id: string): { message: string } {
    return {
      message: `Expense ${id} deletion - to be implemented`,
    };
  }
}
