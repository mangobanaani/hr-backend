import { ConflictException, NotFoundException } from '@nestjs/common';
import { TrainingService } from '../training.service';

const createPrismaMock = () => ({
  training: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('TrainingService', () => {
  let service: TrainingService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new TrainingService(prismaMock as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates training successfully', async () => {
    prismaMock.training.create.mockResolvedValue({ id: 't1' });

    const result = await service.create({ title: 'New Training' } as never);

    expect(prismaMock.training.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 't1' });
  });

  it('throws conflict when Prisma returns P2002', async () => {
    const error = new Error('unique constraint');
    (error as unknown as { code?: string }).code = 'P2002';
    prismaMock.training.create.mockRejectedValue(error);

    await expect(
      service.create({ title: 'Dup' } as never),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when findOne misses', async () => {
    prismaMock.training.findUnique.mockResolvedValue(null);

    await expect(service.findOne('t1')).rejects.toThrow(NotFoundException);
  });

  it('updates existing training', async () => {
    prismaMock.training.findUnique.mockResolvedValue({ id: 't1' });
    prismaMock.training.update.mockResolvedValue({ id: 't1', title: 'Updated' });

    const result = await service.update('t1', { title: 'Updated' } as never);

    expect(prismaMock.training.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 't1', title: 'Updated' });
  });

  it('throws conflict on update when title duplicates', async () => {
    prismaMock.training.findUnique.mockResolvedValue({ id: 't1' });
    const error = new Error('unique');
    (error as unknown as { code?: string }).code = 'P2002';
    prismaMock.training.update.mockRejectedValue(error);

    await expect(
      service.update('t1', { title: 'Dup' } as never),
    ).rejects.toThrow(ConflictException);
  });

  it('removes training after ensuring existence', async () => {
    prismaMock.training.findUnique.mockResolvedValue({ id: 't1' });
    prismaMock.training.delete.mockResolvedValue({ id: 't1' });

    const result = await service.remove('t1');

    expect(prismaMock.training.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 't1' },
      }),
    );
    expect(result).toEqual({ id: 't1' });
  });
});
