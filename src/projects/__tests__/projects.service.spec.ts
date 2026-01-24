import { ConflictException, NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../projects.service';

const createPrismaMock = () => ({
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  employee: {
    findUnique: jest.fn(),
  },
  team: {
    findUnique: jest.fn(),
  },
  teamProject: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
});

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prismaMock: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prismaMock = createPrismaMock();
    service = new ProjectsService(prismaMock as never);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws when manager does not exist', async () => {
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        name: 'New project',
        managerId: 'mgr-1',
      } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates when manager exists', async () => {
    prismaMock.employee.findUnique.mockResolvedValue({ id: 'mgr-1' });
    prismaMock.project.create.mockResolvedValue({ id: 'proj-1' });

    const result = await service.create({
      name: 'New project',
      managerId: 'mgr-1',
    } as never);

    expect(prismaMock.project.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'proj-1' });
  });

  it('throws when findOne misses', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(service.findOne('proj-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when updating a missing project', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(service.update('proj-1', {} as never)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws when updating with invalid manager', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' });
    prismaMock.employee.findUnique.mockResolvedValue(null);

    await expect(
      service.update('proj-1', { managerId: 'mgr-1' } as never),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when removing missing project', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(service.remove('proj-1')).rejects.toThrow(NotFoundException);
  });

  it('throws when removing project has related data', async () => {
    prismaMock.project.findUnique.mockResolvedValue({
      teams: [{}, {}],
      budgetItems: [],
    });

    await expect(service.remove('proj-1')).rejects.toThrow(ConflictException);
  });

  it('throws when assignTeam lacks project or team', async () => {
    prismaMock.project.findUnique.mockResolvedValue(null);

    await expect(
      service.assignTeam('proj-1', 'team-1'),
    ).rejects.toThrow(NotFoundException);

    prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' });
    prismaMock.team.findUnique.mockResolvedValue(null);

    await expect(
      service.assignTeam('proj-1', 'team-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws when assigning already assigned team', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' });
    prismaMock.team.findUnique.mockResolvedValue({ id: 'team-1' });
    prismaMock.teamProject.findUnique.mockResolvedValue({ id: 'tp-1' });

    await expect(
      service.assignTeam('proj-1', 'team-1'),
    ).rejects.toThrow(ConflictException);
  });

  it('creates team assignment when none exists', async () => {
    prismaMock.project.findUnique.mockResolvedValue({ id: 'proj-1' });
    prismaMock.team.findUnique.mockResolvedValue({ id: 'team-1' });
    prismaMock.teamProject.findUnique.mockResolvedValue(null);
    prismaMock.teamProject.create.mockResolvedValue({ id: 'tp-1' });

    const result = await service.assignTeam('proj-1', 'team-1', 'lead');

    expect(prismaMock.teamProject.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          projectId: 'proj-1',
          teamId: 'team-1',
          role: 'lead',
        }),
      }),
    );
    expect(result).toEqual({ id: 'tp-1' });
  });

  it('throws when removing a missing assignment', async () => {
    prismaMock.teamProject.findUnique.mockResolvedValue(null);

    await expect(
      service.removeTeam('proj-1', 'team-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('removes assignment when present', async () => {
    prismaMock.teamProject.findUnique.mockResolvedValue({ id: 'tp-1' });

    const result = await service.removeTeam('proj-1', 'team-1');

    expect(prismaMock.teamProject.delete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          teamId_projectId: {
            projectId: 'proj-1',
            teamId: 'team-1',
          },
        },
      }),
    );
    expect(result).toEqual({ message: 'Team removed from project successfully' });
  });
});
