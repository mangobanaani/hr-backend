import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TimeTrackingService } from '../time-tracking.service';
import { TimeRecordStatus } from '../dto/create-time-record.dto';

const createPrismaMock = () => ({
  employee: {
    findUnique: jest.fn(),
  },
  timeRecord: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('TimeTrackingService', () => {
  let service: TimeTrackingService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new TimeTrackingService(prismaMock as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws when the employee is missing', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        employeeId: 'emp-1',
        date: '2024-01-01',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when a duplicate record exists', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
    prismaMock.timeRecord.findUnique.mockResolvedValue({ id: 'rec-1' });

    await expect(
      service.create({
        employeeId: 'emp-1',
        date: '2024-01-01',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('calculates total hours and subtracts breaks', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'emp-1' });
    prismaMock.timeRecord.findUnique.mockResolvedValue(null);
    const createdRecord = { id: 'rec-1', totalHours: 0 };
    prismaMock.timeRecord.create.mockResolvedValue(createdRecord);

    const dto = {
      employeeId: 'emp-1',
      date: '2024-01-01',
      clockIn: '2024-01-01T08:00:00Z',
      clockOut: '2024-01-01T17:00:00Z',
      breakStart: '2024-01-01T12:00:00Z',
      breakEnd: '2024-01-01T12:30:00Z',
      status: TimeRecordStatus.PENDING,
    };

    const result = await service.create(dto);

    expect(prismaMock.timeRecord.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalHours: 8.5,
        }),
      }),
    );
    expect(result).toBe(createdRecord);
  });

  it('throws when findOne cannot reach a record', async () => {
    prismaMock.timeRecord.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('rejects updates after approval without status change', async () => {
    prismaMock.timeRecord.findUnique.mockResolvedValue({
      id: 'time-1',
      status: 'APPROVED',
    });

    await expect(
      service.update('time-1', {
        employeeId: 'emp-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects approvals when the record is already approved', async () => {
    prismaMock.timeRecord.findUnique.mockResolvedValue({
      id: 'time-1',
      status: 'APPROVED',
    });

    await expect(service.approve('time-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects rejections when the record is already approved', async () => {
    prismaMock.timeRecord.findUnique.mockResolvedValue({
      id: 'time-1',
      status: 'APPROVED',
      notes: 'existing',
    });

    await expect(service.reject('time-1')).rejects.toThrow(BadRequestException);
  });

  it('rejects deletion of approved records', async () => {
    prismaMock.timeRecord.findUnique.mockResolvedValue({
      id: 'time-1',
      status: 'APPROVED',
    });

    await expect(service.remove('time-1')).rejects.toThrow(BadRequestException);
  });

  it('applies filters when finding multiple records', async () => {
    prismaMock.timeRecord.findMany.mockResolvedValue([]);

    await service.findAll('emp-1', '2024-01-01', '2024-01-31');

    expect(prismaMock.timeRecord.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          employeeId: 'emp-1',
          date: expect.objectContaining({
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          }),
        }),
      }),
    );
  });
});
