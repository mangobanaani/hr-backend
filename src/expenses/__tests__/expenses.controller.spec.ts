import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from '../expenses.controller';
import { ExpensesService } from '../expenses.service';
import { CreateExpenseDto } from '../dto/create-expense.dto';

const createServiceMock = () => ({
  createExpense: jest.fn(),
  findAllExpenses: jest.fn(),
  findOneExpense: jest.fn(),
  updateExpense: jest.fn(),
  approveExpense: jest.fn(),
  rejectExpense: jest.fn(),
  removeExpense: jest.fn(),
  createCategory: jest.fn(),
  findAllCategories: jest.fn(),
  findOneCategory: jest.fn(),
  updateCategory: jest.fn(),
  removeCategory: jest.fn(),
});

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(ExpensesController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates expenses via the service', async () => {
    const dto: CreateExpenseDto = {
      employeeId: 'e1',
      categoryId: 'cat-1',
      amount: 10,
    } as never;
    service.createExpense.mockResolvedValue('created');

    await expect(controller.create(dto)).resolves.toBe('created');
    expect(service.createExpense).toHaveBeenCalledWith(dto);
  });

  it('calls service findAll with filter', async () => {
    service.findAllExpenses.mockResolvedValue([]);

    await controller.findAll('e1');
    expect(service.findAllExpenses).toHaveBeenCalledWith('e1');
  });

  it('routes findOne', async () => {
    service.findOneExpense.mockResolvedValue({ id: 'exp-1' });

    await controller.findOne('exp-1');
    expect(service.findOneExpense).toHaveBeenCalledWith('exp-1');
  });

  it('routes update', async () => {
    service.updateExpense.mockResolvedValue('updated');

    await expect(
      controller.update('exp-1', { amount: 5 } as never),
    ).resolves.toBe('updated');
    expect(service.updateExpense).toHaveBeenCalledWith(
      'exp-1',
      expect.any(Object),
    );
  });

  it('routes approve', async () => {
    service.approveExpense.mockResolvedValue('approved');

    await expect(controller.approve('exp-1', 'mgr-1')).resolves.toBe(
      'approved',
    );
    expect(service.approveExpense).toHaveBeenCalledWith('exp-1', 'mgr-1');
  });

  it('routes reject with reason', async () => {
    service.rejectExpense.mockResolvedValue('rejected');

    await controller.reject('exp-1', 'bad');
    expect(service.rejectExpense).toHaveBeenCalledWith('exp-1', 'bad');
  });

  it('routes remove', async () => {
    service.removeExpense.mockResolvedValue({ message: 'gone' });

    await expect(controller.remove('exp-1')).resolves.toEqual({
      message: 'gone',
    });
    expect(service.removeExpense).toHaveBeenCalledWith('exp-1');
  });

  it('creates category', async () => {
    service.createCategory.mockResolvedValue('cat');
    await expect(controller.createCategory({ name: 'New' } as never)).resolves.toBe(
      'cat',
    );
    expect(service.createCategory).toHaveBeenCalledWith(expect.any(Object));
  });

  it('returns categories list', async () => {
    service.findAllCategories.mockResolvedValue([]);
    await controller.findAllCategories();
    expect(service.findAllCategories).toHaveBeenCalled();
  });

  it('routes category details', async () => {
    service.findOneCategory.mockResolvedValue({ id: 'cat-1' });
    await controller.findOneCategory('cat-1');
    expect(service.findOneCategory).toHaveBeenCalledWith('cat-1');
  });

  it('updates category', async () => {
    service.updateCategory.mockResolvedValue('updated');
    await expect(
      controller.updateCategory('cat-1', { name: 'X' } as never),
    ).resolves.toBe('updated');
    expect(service.updateCategory).toHaveBeenCalledWith(
      'cat-1',
      expect.any(Object),
    );
  });

  it('removes category', async () => {
    service.removeCategory.mockResolvedValue({ message: 'removed' });
    await expect(controller.removeCategory('cat-1')).resolves.toEqual({
      message: 'removed',
    });
    expect(service.removeCategory).toHaveBeenCalledWith('cat-1');
  });
});
