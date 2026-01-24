import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import type { Prisma, TimeRecord } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateTimeRecordDto } from './dto/create-time-record.dto';
import { UpdateTimeRecordDto } from './dto/update-time-record.dto';
import { CursorPaginationDto } from '../common/dto/cursor-pagination.dto';
import { CursorPaginatedResponse, createCursorPaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class TimeTrackingService {
  constructor(private readonly prisma: PrismaService) {}

  private hasText(value?: string | null): value is string {
    return value !== undefined && value !== null && value !== '';
  }

  private toDate(value?: string | null): Date | undefined {
    return this.hasText(value) ? new Date(value) : undefined;
  }

  async create(createTimeRecordDto: CreateTimeRecordDto): Promise<TimeRecord> {
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

    const clockInDate = this.toDate(createTimeRecordDto.clockIn);
    const clockOutDate = this.toDate(createTimeRecordDto.clockOut);
    let { totalHours } = createTimeRecordDto;

    if (clockInDate && clockOutDate) {
      const diffMs = clockOutDate.getTime() - clockInDate.getTime();
      totalHours = diffMs / (1000 * 60 * 60);

      const breakStartDate = this.toDate(createTimeRecordDto.breakStart);
      const breakEndDate = this.toDate(createTimeRecordDto.breakEnd);
      if (breakStartDate && breakEndDate) {
        const breakMs = breakEndDate.getTime() - breakStartDate.getTime();
        totalHours -= breakMs / (1000 * 60 * 60);
      }
    }

    const breakStartDate = this.toDate(createTimeRecordDto.breakStart);
    const breakEndDate = this.toDate(createTimeRecordDto.breakEnd);

    const timeRecord = await this.prisma.timeRecord.create({
      data: {
        employeeId: createTimeRecordDto.employeeId,
        date: new Date(createTimeRecordDto.date),
        clockIn: clockInDate,
        clockOut: clockOutDate,
        breakStart: breakStartDate,
        breakEnd: breakEndDate,
        totalHours,
        status: createTimeRecordDto.status,
        notes: createTimeRecordDto.notes,
        location: (createTimeRecordDto.location ??
          undefined) as Prisma.InputJsonValue,
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

  async findAll(
    employeeId?: string,
    startDate?: string,
    endDate?: string,
    pagination?: CursorPaginationDto,
  ): Promise<CursorPaginatedResponse<TimeRecord>> {
    const { cursor, limit = 20 } = pagination || {};
    const where: Prisma.TimeRecordWhereInput = {};

    if (employeeId !== undefined && employeeId.length > 0) {
      where.employeeId = employeeId;
    }

    if (
      (startDate !== undefined && startDate.length > 0) ||
      (endDate !== undefined && endDate.length > 0)
    ) {
      where.date = {};
      if (startDate !== undefined && startDate.length > 0) {
        where.date.gte = new Date(startDate);
      }
      if (endDate !== undefined && endDate.length > 0) {
        where.date.lte = new Date(endDate);
      }
    }

    // Cursor-based pagination
    if (cursor) {
      where.id = { lt: cursor }; // Get records before this cursor (older records)
    }

    const timeRecords = await this.prisma.timeRecord.findMany({
      where,
      take: limit + 1, // Fetch one extra to check if there's more
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
      orderBy: { createdAt: 'desc' },
    });

    return createCursorPaginatedResponse(timeRecords, limit, cursor);
  }

  async findOne(id: string): Promise<TimeRecord> {
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

  async update(
    id: string,
    updateTimeRecordDto: UpdateTimeRecordDto,
  ): Promise<TimeRecord> {
    const existingRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException('Time record not found');
    }

    // Prevent update if already approved
    if (
      existingRecord.status === 'APPROVED' &&
      updateTimeRecordDto.status === undefined
    ) {
      throw new BadRequestException('Cannot modify approved time record');
    }

    // Recalculate total hours if times are updated
    let { totalHours } = updateTimeRecordDto;
    const clockIn =
      this.toDate(updateTimeRecordDto.clockIn) ?? existingRecord.clockIn;
    const clockOut =
      this.toDate(updateTimeRecordDto.clockOut) ?? existingRecord.clockOut;

    if (clockIn !== null && clockOut !== null && totalHours === undefined) {
      const diffMs = clockOut.getTime() - clockIn.getTime();
      totalHours = diffMs / (1000 * 60 * 60);

      const breakStart =
        this.toDate(updateTimeRecordDto.breakStart) ??
        existingRecord.breakStart;
      const breakEnd =
        this.toDate(updateTimeRecordDto.breakEnd) ?? existingRecord.breakEnd;

      if (breakStart && breakEnd) {
        const breakMs = breakEnd.getTime() - breakStart.getTime();
        totalHours -= breakMs / (1000 * 60 * 60);
      }
    }

    const timeRecord = await this.prisma.timeRecord.update({
      where: { id },
      data: {
        date: this.toDate(updateTimeRecordDto.date),
        clockIn: this.toDate(updateTimeRecordDto.clockIn),
        clockOut: this.toDate(updateTimeRecordDto.clockOut),
        breakStart: this.toDate(updateTimeRecordDto.breakStart),
        breakEnd: this.toDate(updateTimeRecordDto.breakEnd),
        totalHours,
        status: updateTimeRecordDto.status,
        notes: updateTimeRecordDto.notes,
        location: (updateTimeRecordDto.location ??
          undefined) as Prisma.InputJsonValue,
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

  async approve(id: string): Promise<TimeRecord> {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    if (
      timeRecord.status !== 'PENDING' &&
      timeRecord.status !== 'NEEDS_REVIEW'
    ) {
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

  async reject(id: string, reason?: string): Promise<TimeRecord> {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    if (
      timeRecord.status !== 'PENDING' &&
      timeRecord.status !== 'NEEDS_REVIEW'
    ) {
      throw new BadRequestException(
        'Only pending or needs review time records can be rejected',
      );
    }

    const updatedRecord = await this.prisma.timeRecord.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason ?? timeRecord.notes,
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

  async remove(id: string): Promise<{ message: string }> {
    const timeRecord = await this.prisma.timeRecord.findUnique({
      where: { id },
    });

    if (!timeRecord) {
      throw new NotFoundException('Time record not found');
    }

    // Prevent deletion if already approved
    if (timeRecord.status === 'APPROVED') {
      throw new BadRequestException('Cannot delete approved time record');
    }

    await this.prisma.timeRecord.delete({
      where: { id },
    });

    return { message: 'Time record deleted successfully' };
  }
}
