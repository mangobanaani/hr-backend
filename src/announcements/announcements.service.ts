import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { Announcement } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<Announcement> {
    return this.prisma.announcement.create({ data: createAnnouncementDto });
  }

  async findAll(): Promise<Announcement[]> {
    return this.prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }

    return announcement;
  }

  async update(
    id: string,
    updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<Announcement> {
    await this.findOne(id); // Verify announcement exists

    return this.prisma.announcement.update({
      where: { id },
      data: updateAnnouncementDto,
    });
  }

  async remove(id: string): Promise<Announcement> {
    await this.findOne(id); // Verify announcement exists

    return this.prisma.announcement.delete({ where: { id } });
  }
}
