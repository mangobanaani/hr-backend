import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    // Validate manager if provided
    if (createProjectDto.managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: createProjectDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    const project = await this.prisma.project.create({
      data: createProjectDto,
    });

    return project;
  }

  async findAll() {
    const projects = await this.prisma.project.findMany({
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        budgetItems: {
          select: {
            id: true,
            category: true,
            budgeted: true,
            actual: true,
            currency: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects;
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        budgetItems: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException('Project not found');
    }

    // Validate manager if being updated
    if (updateProjectDto.managerId) {
      const manager = await this.prisma.employee.findUnique({
        where: { id: updateProjectDto.managerId },
      });
      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    const project = await this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        teams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  async remove(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        teams: true,
        budgetItems: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if project has associated data
    if (project.teams.length > 0 || project.budgetItems.length > 0) {
      throw new ConflictException(
        'Cannot delete project with associated teams or budget items. Please remove them first.',
      );
    }

    await this.prisma.project.delete({
      where: { id },
    });

    return { message: 'Project deleted successfully' };
  }

  async assignTeam(projectId: string, teamId: string, role?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const team = await this.prisma.team.findUnique({
      where: { id: teamId },
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if already assigned
    const existing = await this.prisma.teamProject.findUnique({
      where: {
        teamId_projectId: {
          teamId,
          projectId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Team is already assigned to this project');
    }

    const teamProject = await this.prisma.teamProject.create({
      data: {
        teamId,
        projectId,
        role,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return teamProject;
  }

  async removeTeam(projectId: string, teamId: string) {
    const teamProject = await this.prisma.teamProject.findUnique({
      where: {
        teamId_projectId: {
          teamId,
          projectId,
        },
      },
    });

    if (!teamProject) {
      throw new NotFoundException('Team assignment not found');
    }

    await this.prisma.teamProject.delete({
      where: {
        teamId_projectId: {
          teamId,
          projectId,
        },
      },
    });

    return { message: 'Team removed from project successfully' };
  }
}
