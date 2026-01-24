import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from '../projects.controller';
import { ProjectsService } from '../projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

const createServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  assignTeam: jest.fn(),
  removeTeam: jest.fn(),
});

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ReturnType<typeof createServiceMock>;

  beforeEach(async () => {
    service = createServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get(ProjectsController);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls service create', async () => {
    const dto: CreateProjectDto = { name: 'project' } as never;
    service.create.mockResolvedValue('created');

    await expect(controller.create(dto)).resolves.toBe('created');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('calls service findAll', async () => {
    service.findAll.mockResolvedValue([]);

    await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('calls service findOne', async () => {
    service.findOne.mockResolvedValue({ id: 'proj-1' });

    await controller.findOne('proj-1');
    expect(service.findOne).toHaveBeenCalledWith('proj-1');
  });

  it('calls service update', async () => {
    const dto: UpdateProjectDto = { name: 'updated' } as never;
    service.update.mockResolvedValue('updated');

    await expect(controller.update('proj-1', dto)).resolves.toBe('updated');
    expect(service.update).toHaveBeenCalledWith('proj-1', dto);
  });

  it('calls service remove', async () => {
    service.remove.mockResolvedValue({ message: 'gone' });

    await expect(controller.remove('proj-1')).resolves.toEqual({
      message: 'gone',
    });
    expect(service.remove).toHaveBeenCalledWith('proj-1');
  });

  it('assigns team with optional role', async () => {
    service.assignTeam.mockResolvedValue('assigned');

    await expect(
      controller.assignTeam('proj-1', 'team-1', 'lead'),
    ).resolves.toBe('assigned');
    expect(service.assignTeam).toHaveBeenCalledWith('proj-1', 'team-1', 'lead');
  });

  it('removes team assignments', async () => {
    service.removeTeam.mockResolvedValue({ message: 'done' });

    await expect(controller.removeTeam('proj-1', 'team-1')).resolves.toEqual({
      message: 'done',
    });
    expect(service.removeTeam).toHaveBeenCalledWith('proj-1', 'team-1');
  });
});
