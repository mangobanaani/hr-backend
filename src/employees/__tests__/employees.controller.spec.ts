import { Test } from '@nestjs/testing';
import { EmployeesController } from '../employees.controller';
import { EmployeesService } from '../employees.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('EmployeesController', () => {
  let controller: EmployeesController;

  const mockEmployeesService = {
    update: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = moduleRef.get<EmployeesController>(EmployeesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updates via PUT', async () => {
    mockEmployeesService.update.mockResolvedValue({ id: 'e1' });

    await controller.replace('e1', { firstName: 'New' });

    expect(mockEmployeesService.update).toHaveBeenCalledWith('e1', {
      firstName: 'New',
    });
  });
});
