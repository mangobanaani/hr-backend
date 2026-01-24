import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackingController } from '../time-tracking.controller';
import { TimeTrackingService } from '../time-tracking.service';
import { CreateTimeRecordDto } from '../dto/create-time-record.dto';
import { UpdateTimeRecordDto } from '../dto/update-time-record.dto';

const createMockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  approve: jest.fn(),
  reject: jest.fn(),
  remove: jest.fn(),
});

describe('TimeTrackingController', () => {
  let controller: TimeTrackingController;
  let serviceMock: ReturnType<typeof createMockService>;

  beforeEach(async () => {
    serviceMock = createMockService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeTrackingController],
      providers: [
        {
          provide: TimeTrackingService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get(TimeTrackingController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('forwards create requests to the service', async () => {
    const dto: CreateTimeRecordDto = {
      employeeId: 'emp-1',
      date: '2024-01-01',
      status: undefined,
      clockIn: undefined,
      clockOut: undefined,
      breakStart: undefined,
      breakEnd: undefined,
      totalHours: undefined,
      notes: undefined,
      location: undefined,
    };
    serviceMock.create.mockResolvedValue('created');

    await expect(controller.create(dto)).resolves.toBe('created');
    expect(serviceMock.create).toHaveBeenCalledWith(dto);
  });

  it('passes query filters to findAll', async () => {
    serviceMock.findAll.mockResolvedValue([]);

    await controller.findAll('emp-1', '2024-01-01', '2024-01-31');
    expect(serviceMock.findAll).toHaveBeenCalledWith(
      'emp-1',
      '2024-01-01',
      '2024-01-31',
    );
  });

  it('forwards findOne parameters', async () => {
    serviceMock.findOne.mockResolvedValue({ id: 'time-1' });

    await controller.findOne('time-1');
    expect(serviceMock.findOne).toHaveBeenCalledWith('time-1');
  });

  it('updates using the service', async () => {
    const updateDto: UpdateTimeRecordDto = {
      employeeId: 'emp-1',
      date: '2024-01-01',
    };
    serviceMock.update.mockResolvedValue('updated');

    await expect(controller.update('time-1', updateDto)).resolves.toBe('updated');
    expect(serviceMock.update).toHaveBeenCalledWith('time-1', updateDto);
  });

  it('approves entries via the service', async () => {
    serviceMock.approve.mockResolvedValue('approved');

    await expect(controller.approve('time-1')).resolves.toBe('approved');
    expect(serviceMock.approve).toHaveBeenCalledWith('time-1');
  });

  it('rejects entries with reason', async () => {
    serviceMock.reject.mockResolvedValue('rejected');

    await controller.reject('time-1', 'bad data');
    expect(serviceMock.reject).toHaveBeenCalledWith('time-1', 'bad data');
  });

  it('removes entries via the service', async () => {
    serviceMock.remove.mockResolvedValue({ message: 'done' });

    await expect(controller.remove('time-1')).resolves.toEqual({ message: 'done' });
    expect(serviceMock.remove).toHaveBeenCalledWith('time-1');
  });
});
