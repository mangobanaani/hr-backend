import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTimeRecordDto } from './dto/create-time-record.dto';
import { UpdateTimeRecordDto } from './dto/update-time-record.dto';

@Injectable()
export class TimeTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTimeRecordDto: CreateTimeRecordDto) {
    // Validate employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createTimeRecordDto.employeeId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Check if record already exists for this employee and date
    const existing = await this.prisma.timeRecord.findUnique({
      where: {
        employeeId_date: {
          employeeId: createTimeRecordDto.employeeId,
          date: new Date(createTimeRecordDto.date),
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Time record already exists for this employee on this date',
      );
    }

    // Calculate total hours if clock in/out provided
    let totalHours = createTimeRecordDto.totalHours;
    if (createTimeRecordDto.clockIn && createTimeRecordDto.clockOut) {
      const clockIn = new Date(createTimeRecordDto.clockIn);
      const clockOut = new Date(createTimeRecordDto.clockOut);
      const diffMs = clockOut.getTime() - clockIn.getTime();
      totalHours = diffMs / (1000 * 60 * 60); // Convert to hours

      // Subtract break time if provided
      if (createTimeRecordDto.breakStart && createTimeRecordDto.breakEnd) {
        const breakStart = new Date(createTimeRecordDto.breakStart);
        const breakEnd = new Date(createTimeRecordDto.breakEnd);
        const breakMs = breakEnd.getTime() - breakStart.getTime();
        totalHours -= breakMs / (1000 * 60 * 60);
      }
    }

    const timeRecord = await this.prisma.timeRecord.create({
      data: {
        employeeId: createTimeRecordDto.employeeId,
        date: new Date(createTimeRecordDto.date),
        clockIn: createTimeRecordDto.clockIn ? new Date(createTimeRecordDto.clockIn) : undefined,
        clockOut: createTimeRecordDto.clockOut ? new Date(createTimeRecordDto.clockOut) : undefined,
        breakStart: createTimeRecordDto.breakStart ? new Date(createTimeRecordDto.breakStart) : undefined,
        breakEnd: createTimeRecordDto.breakEnd ? new Date(createTimeRecordDto.breakEnd) : undefined,
        totalHours,
        status: createTimeRecordDto.status as any,
        notes: createTimeRecordDto.notes,
        location: createTimeRecordDto.location ? JSON.stringify(createTimeRecordDto.location) : undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return timeRecord;
  }

  async findAll(employeeId?: string, startDate?: string, endDate?: string) {
    const where: any = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const timeRecords = await this.prisma.timeRecord.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return timeRecords;
  }

  async findOne(id: string) {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    return timeRecord;
  }

  async update(id: string, updateTimeRecordDto: UpdateTimeRecordDto) {
    const existingRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException('Time record not found');
    }

    // Prevent update if already approved
    if (existingRecord.status === 'APPROVED' && !updateTimeRecordDto.status) {
      throw new BadRequestException(
        'Cannot modify approved time record',
      );
    }

    // Recalculate total hours if times are updated
    let totalHours = updateTimeRecordDto.totalHours;
    const clockIn = updateTimeRecordDto.clockIn ? new Date(updateTimeRecordDto.clockIn) : existingRecord.clockIn;
    const clockOut = updateTimeRecordDto.clockOut ? new Date(updateTimeRecordDto.clockOut) : existingRecord.clockOut;

    if (clockIn && clockOut && !totalHours) {
      const diffMs = clockOut.getTime() - clockIn.getTime();
      totalHours = diffMs / (1000 * 60 * 60);

      const breakStart = updateTimeRecordDto.breakStart ? new Date(updateTimeRecordDto.breakStart) : existingRecord.breakStart;
      const breakEnd = updateTimeRecordDto.breakEnd ? new Date(updateTimeRecordDto.breakEnd) : existingRecord.breakEnd;

      if (breakStart && breakEnd) {
        const breakMs = breakEnd.getTime() - breakStart.getTime();
        totalHours -= breakMs / (1000 * 60 * 60);
      }
    }

    const timeRecord = await this.prisma.timeRecord.update({
      where: { id },
      data: {
        date: updateTimeRecordDto.date ? new Date(updateTimeRecordDto.date) : undefined,
        clockIn: updateTimeRecordDto.clockIn ? new Date(updateTimeRecordDto.clockIn) : undefined,
        clockOut: updateTimeRecordDto.clockOut ? new Date(updateTimeRecordDto.clockOut) : undefined,
        breakStart: updateTimeRecordDto.breakStart ? new Date(updateTimeRecordDto.breakStart) : undefined,
        breakEnd: updateTimeRecordDto.breakEnd ? new Date(updateTimeRecordDto.breakEnd) : undefined,
        totalHours,
        status: updateTimeRecordDto.status as any,
        notes: updateTimeRecordDto.notes,
        location: updateTimeRecordDto.location ? JSON.stringify(updateTimeRecordDto.location) : undefined,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return timeRecord;
  }

  async approve(id: string) {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    if (timeRecord.status !== 'PENDING' && timeRecord.status !== 'NEEDS_REVIEW') {
      throw new BadRequestException(
        'Only pending or needs review time records can be approved',
      );
    }

    const updatedRecord = await this.prisma.timeRecord.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedRecord;
  }

  async reject(id: string, reason?: string) {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    if (timeRecord.status !== 'PENDING' && timeRecord.status !== 'NEEDS_REVIEW') {
      throw new BadRequestException(
        'Only pending or needs review time records can be rejected',
      );
    }

    const updatedRecord = await this.prisma.timeRecord.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason || timeRecord.notes,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedRecord;
  }

  async remove(id: string) {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    // Prevent deletion if already approved
    if (timeRecord.status === 'APPROVED') {
      throw new BadRequestException(
        'Cannot delete approved time record',
      );
    }

    await this.prisma.timeRecord.delete({
      where: { id },
    });

    return { message: 'Time record deleted successfully' };
  }
}
