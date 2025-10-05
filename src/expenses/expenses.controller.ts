import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  // ==================== Expenses ====================

  @Post()
  @ApiOperation({
    summary: 'Create expense',
    description: 'Create a new expense report or reimbursement request',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense created successfully',
  })
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expensesService.createExpense(createExpenseDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all expenses',
    description: 'Retrieve a list of all expense reports',
  })
  @ApiQuery({
    name: 'employeeId',
    required: false,
    description: 'Filter by employee ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Expenses list retrieved successfully',
  })
  async findAll(@Query('employeeId') employeeId?: string) {
    return this.expensesService.findAllExpenses(employeeId);
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
  async findOne(@Param('id') id: string) {
    return this.expensesService.findOneExpense(id);
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
  async update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.updateExpense(id, updateExpenseDto);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve expense',
    description: 'Approve a pending expense',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense approved successfully',
  })
  async approve(
    @Param('id') id: string,
    @Body('approverId') approverId: string,
  ) {
    return this.expensesService.approveExpense(id, approverId);
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject expense',
    description: 'Reject a pending expense',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense rejected successfully',
  })
  async reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.expensesService.rejectExpense(id, reason);
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
  async remove(@Param('id') id: string) {
    return this.expensesService.removeExpense(id);
  }

  // ==================== Expense Categories ====================

  @Post('categories')
  @ApiOperation({
    summary: 'Create expense category',
    description: 'Create a new expense category',
  })
  @ApiResponse({
    status: 201,
    description: 'Expense category created successfully',
  })
  async createCategory(@Body() createCategoryDto: CreateExpenseCategoryDto) {
    return this.expensesService.createCategory(createCategoryDto);
  }

  @Get('categories')
  @ApiOperation({
    summary: 'Get all expense categories',
    description: 'Retrieve a list of all expense categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense categories retrieved successfully',
  })
  async findAllCategories() {
    return this.expensesService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({
    summary: 'Get expense category by ID',
    description: 'Retrieve a specific expense category by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense category ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense category retrieved successfully',
  })
  async findOneCategory(@Param('id') id: string) {
    return this.expensesService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @ApiOperation({
    summary: 'Update expense category',
    description: 'Update an existing expense category',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense category ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense category updated successfully',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateExpenseCategoryDto,
  ) {
    return this.expensesService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({
    summary: 'Delete expense category',
    description: 'Delete an expense category from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Expense category ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Expense category deleted successfully',
  })
  async removeCategory(@Param('id') id: string) {
    return this.expensesService.removeCategory(id);
  }
}
