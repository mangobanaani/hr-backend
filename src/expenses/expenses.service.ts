import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== Expenses ====================

  async createExpense(createExpenseDto: CreateExpenseDto) {
    // Validate employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createExpenseDto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate category exists
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: createExpenseDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    // Check if expense exceeds category limit
    if (category.maxAmount && createExpenseDto.amount > Number(category.maxAmount)) {
      throw new BadRequestException(
        `Expense amount exceeds category maximum of ${category.maxAmount} ${category.currency}`,
      );
    }

    const expense = await this.prisma.expense.create({
      data: createExpenseDto as any,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return expense;
  }

  async findAllExpenses(employeeId?: string) {
    const where = employeeId ? { employeeId } : {};

    const expenses = await this.prisma.expense.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
      orderBy: { submittedAt: 'desc' },
    });

    return expenses;
  }

  async findOneExpense(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async updateExpense(id: string, updateExpenseDto: UpdateExpenseDto) {
    const existingExpense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!existingExpense) {
      throw new NotFoundException('Expense not found');
    }

    // Prevent update if already approved or reimbursed
    if (
      ['APPROVED', 'REIMBURSED'].includes(existingExpense.status) &&
      !updateExpenseDto.status
    ) {
      throw new BadRequestException(
        'Cannot modify expense that has been approved or reimbursed',
      );
    }

    const { employeeId, categoryId, ...updateData } = updateExpenseDto;

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateData as any,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return expense;
  }

  async approveExpense(id: string, approverId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending expenses can be approved',
      );
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: approverId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return updatedExpense;
  }

  async rejectExpense(id: string, reason?: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    if (expense.status !== 'PENDING') {
      throw new BadRequestException(
        'Only pending expenses can be rejected',
      );
    }

    const updatedExpense = await this.prisma.expense.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedAt: new Date(),
        comments: reason || expense.comments,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: true,
      },
    });

    return updatedExpense;
  }

  async removeExpense(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    // Prevent deletion if already reimbursed
    if (expense.status === 'REIMBURSED') {
      throw new BadRequestException(
        'Cannot delete expense that has been reimbursed',
      );
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    return { message: 'Expense deleted successfully' };
  }

  // ==================== Expense Categories ====================

  async createCategory(createCategoryDto: CreateExpenseCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(
        'An expense category with this name already exists',
      );
    }

    const category = await this.prisma.expenseCategory.create({
      data: createCategoryDto,
    });

    return category;
  }

  async findAllCategories() {
    const categories = await this.prisma.expenseCategory.findMany({
      include: {
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateExpenseCategoryDto) {
    const existingCategory = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException('Expense category not found');
    }

    // Check for name conflicts if name is being updated
    if (
      updateCategoryDto.name &&
      updateCategoryDto.name !== existingCategory.name
    ) {
      const nameConflict = await this.prisma.expenseCategory.findUnique({
        where: { name: updateCategoryDto.name },
      });

      if (nameConflict) {
        throw new ConflictException(
          'An expense category with this name already exists',
        );
      }
    }

    const category = await this.prisma.expenseCategory.update({
      where: { id },
      data: updateCategoryDto,
    });

    return category;
  }

  async removeCategory(id: string) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Expense category not found');
    }

    // Check if there are expenses using this category
    if (category.expenses.length > 0) {
      throw new ConflictException(
        'Cannot delete category with associated expenses. Please reassign or delete expenses first.',
      );
    }

    await this.prisma.expenseCategory.delete({
      where: { id },
    });

    return { message: 'Expense category deleted successfully' };
  }
}
