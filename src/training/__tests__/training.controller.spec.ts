import { Test, TestingModule } from '@nestjs/testing';
import { TrainingController } from '../training.controller';
import { TrainingService } from '../training.service';
import { CreateTrainingDto } from '../dto/create-training.dto';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('TrainingController', () => {
  let controller: TrainingController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrainingController],
      providers: [
        {
          provide: TrainingService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(TrainingController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates training via service', async () => {
    const dto: CreateTrainingDto = { title: 'New' } as never;
    service.create.mockResolvedValue('created');

    await expect(controller.create(dto)).resolves.toBe('created');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('calls findAll', async () => {
    service.findAll.mockResolvedValue([]);

    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('routes findOne', async () => {
    service.findOne.mockResolvedValue({ id: 't1' });

    await controller.findOne('t1');
    expect(service.findOne).toHaveBeenCalledWith('t1');
  });

  it('updates training', async () => {
    service.update.mockResolvedValue('updated');

    await expect(
      controller.update('t1', { title: 'X' } as never),
    ).resolves.toBe('updated');
    expect(service.update).toHaveBeenCalledWith('t1', expect.any(Object));
  });

  it('removes training', async () => {
    service.remove.mockResolvedValue({ id: 't1' });

    await expect(controller.remove('t1')).resolves.toEqual({ id: 't1' });
    expect(service.remove).toHaveBeenCalledWith('t1');
  });
});
