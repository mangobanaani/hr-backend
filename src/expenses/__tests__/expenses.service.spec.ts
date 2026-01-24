import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ExpensesService } from '../expenses.service';

const createPrismaMock = () => ({
  employee: {
    findUnique: jest.fn(),
  },
  expenseCategory: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  expense: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new ExpensesService(prismaMock as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws when employee does not exist', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(
      service.createExpense({
        employeeId: 'e1',
        categoryId: 'cat-1',
        amount: 10,
      } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when category does not exist', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'e1' });
    prismaMock.expenseCategory.findUnique.mockResolvedValue(null);

    await expect(
      service.createExpense({
        employeeId: 'e1',
        categoryId: 'cat-1',
        amount: 10,
      } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when amount exceeds category max', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'e1' });
    prismaMock.expenseCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      maxAmount: 50,
      currency: 'USD',
    });

    await expect(
      service.createExpense({
        employeeId: 'e1',
        categoryId: 'cat-1',
        amount: 100,
      } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('creates expense when prerequisites met', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'e1' });
    prismaMock.expenseCategory.findUnique.mockResolvedValue({
      id: 'cat-1',
      maxAmount: 100,
      currency: 'USD',
    });
    prismaMock.expense.create.mockResolvedValue({
      id: 'exp-1',
    });

    const result = await service.createExpense({
      employeeId: 'e1',
      categoryId: 'cat-1',
      amount: 10,
    } as never);

    expect(prismaMock.expense.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'exp-1' });
  });

  it('throws when findOne missing', async () => {
    prismaMock.expense.findUnique.mockResolvedValue(null);

    await expect(service.findOneExpense('exp-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when updating a non-existent expense', async () => {
    prismaMock.expense.findUnique.mockResolvedValue(null);

    await expect(
      service.updateExpense('exp-1', { amount: 5 } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when updating approved/reimbursed expense without status', async () => {
    prismaMock.expense.findUnique.mockResolvedValue({
      status: 'APPROVED',
    });

    await expect(
      service.updateExpense('exp-1', { amount: 5 } as never),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when approving non-pending expense', async () => {
    prismaMock.expense.findUnique.mockResolvedValue({
      status: 'APPROVED',
    });

    await expect(
      service.approveExpense('exp-1', 'mgr-1'),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when rejecting non-pending expense', async () => {
    prismaMock.expense.findUnique.mockResolvedValue({
      status: 'APPROVED',
      comments: 'existing',
    });

    await expect(service.rejectExpense('exp-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when removing reimbursed expense', async () => {
    prismaMock.expense.findUnique.mockResolvedValue({
      status: 'REIMBURSED',
    });

    await expect(service.removeExpense('exp-1')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws when creating category with duplicate name', async () => {
    prismaMock.expenseCategory.findUnique.mockResolvedValue({ id: 'cat-1' });

    await expect(
      service.createCategory({ name: 'Travel' } as never),
    ).rejects.toThrow(ConflictException);
  });

  it('creates category when no conflict', async () => {
    prismaMock.expenseCategory.findUnique.mockResolvedValue(null);
    prismaMock.expenseCategory.create.mockResolvedValue({ id: 'cat-1' });

    const result = await service.createCategory({ name: 'Travel' } as never);

    expect(prismaMock.expenseCategory.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'cat-1' });
  });

  it('throws when category update target missing', async () => {
    prismaMock.expenseCategory.findUnique.mockResolvedValue(null);

    await expect(
      service.updateCategory('cat-1', { name: 'New' } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when category update name conflicts', async () => {
    prismaMock.expenseCategory.findUnique
      .mockResolvedValueOnce({ id: 'cat-1', name: 'Travel' })
      .mockResolvedValueOnce({ id: 'cat-2' });

    await expect(
      service.updateCategory('cat-1', { name: 'Other' } as never),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when deleting category with expenses', async () => {
    prismaMock.expenseCategory.findUnique.mockResolvedValue({
      expenses: [{}],
    });

    await expect(service.removeCategory('cat-1')).rejects.toThrow(
      ConflictException,
    );
  });
});
