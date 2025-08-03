import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to database', async () => {
      // Arrange
      const connectSpy = jest
        .spyOn(service, '$connect')
        .mockImplementation(async () => Promise.resolve());

      // Act
      await service.onModuleInit();

      // Assert
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect from database', async () => {
      // Arrange
      const disconnectSpy = jest
        .spyOn(service, '$disconnect')
        .mockImplementation(async () => Promise.resolve());

      // Act
      await service.onModuleDestroy();

      // Assert
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});
