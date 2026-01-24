import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  CreateEmployeeDto,
  EmploymentStatus,
  Gender,
} from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './dto/employee-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterDto, SortOrder } from '../common/dto/filter.dto';
import { PaginatedResponse, createPaginatedResponse } from '../common/interfaces/paginated-response.interface';

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    department: { select: { id: true; name: true } };
    manager: { select: { id: true; firstName: true; lastName: true } };
    location: { select: { id: true; name: true; address: true } };
  };
}>;

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  private getEmployeeInclude(): Prisma.EmployeeInclude {
    return {
      department: { select: { id: true, name: true } },
      manager: { select: { id: true, firstName: true, lastName: true } },
      location: { select: { id: true, name: true, address: true } },
    };
  }

  private buildAddress(
    dto: Partial<CreateEmployeeDto>,
  ): Prisma.JsonObject | undefined {
    const address: Prisma.JsonObject = {
      address: dto.address,
      city: dto.city,
      state: dto.state,
      postalCode: dto.postalCode,
      country: dto.country,
    };

    const hasValue = Object.values(address).some(
      (value) => value !== undefined && value !== null && value !== '',
    );

    return hasValue ? address : undefined;
  }

  private buildEmergencyContact(
    dto: Partial<CreateEmployeeDto>,
  ): Prisma.JsonObject | undefined {
    const emergencyContact: Prisma.JsonObject = {
      name: dto.emergencyContactName,
      phone: dto.emergencyContactPhone,
    };

    const hasValue = Object.values(emergencyContact).some(
      (value) => value !== undefined && value !== null && value !== '',
    );

    return hasValue ? emergencyContact : undefined;
  }

  private extractAddress(
    address: Prisma.JsonValue | null | undefined,
  ): Record<string, string | undefined> {
    if (address === null || address === undefined) {
      return {};
    }

    if (typeof address === 'string') {
      return { address };
    }

    if (typeof address === 'object') {
      const record = address as Record<string, string | undefined>;
      return {
        address: record.address ?? record.street,
        city: record.city,
        state: record.state,
        postalCode: record.postalCode ?? record.zipCode,
        country: record.country,
      };
    }

    return {};
  }

  private extractEmergencyContact(
    contact: Prisma.JsonValue | null | undefined,
  ): Record<string, string | undefined> {
    if (contact === null || contact === undefined) {
      return {};
    }

    if (typeof contact === 'string') {
      return { name: contact };
    }

    if (typeof contact === 'object') {
      const record = contact as Record<string, string | undefined>;
      return {
        name: record.name,
        phone: record.phone,
      };
    }

    return {};
  }

  private extractLocationCity(
    address: Prisma.JsonValue | null | undefined,
  ): string | undefined {
    if (address === null || address === undefined) {
      return undefined;
    }

    if (typeof address === 'string') {
      return undefined;
    }

    if (typeof address === 'object') {
      const record = address as Record<string, string | undefined>;
      return record.city;
    }

    return undefined;
  }

  private mapEmployee(employee: EmployeeWithRelations): EmployeeResponseDto {
    const address = this.extractAddress(employee.address);
    const emergencyContact = this.extractEmergencyContact(
      employee.emergencyContact,
    );
    const locationCity = employee.location
      ? this.extractLocationCity(employee.location.address)
      : undefined;

    return {
      id: employee.id,
      employeeNumber: employee.employeeNumber,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone ?? undefined,
      dateOfBirth: employee.dateOfBirth ?? undefined,
      gender: employee.gender ? (employee.gender as Gender) : undefined,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      hireDate: employee.hireDate,
      terminationDate: employee.terminationDate ?? undefined,
      status: employee.status as EmploymentStatus,
      emergencyContactName: emergencyContact.name,
      emergencyContactPhone: emergencyContact.phone,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      department: employee.department
        ? {
            id: employee.department.id,
            name: employee.department.name,
          }
        : undefined,
      manager: employee.manager
        ? {
            id: employee.manager.id,
            firstName: employee.manager.firstName,
            lastName: employee.manager.lastName,
          }
        : undefined,
      location:
        employee.location && locationCity !== undefined
          ? {
              id: employee.location.id,
              name: employee.location.name,
              city: locationCity,
            }
          : undefined,
    };
  }

  async create(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const address = this.buildAddress(createEmployeeDto);
    const emergencyContact = this.buildEmergencyContact(createEmployeeDto);
    try {
      const dateOfBirthValue = createEmployeeDto.dateOfBirth;
      const terminationDateValue = createEmployeeDto.terminationDate;

      const employeeData: Prisma.EmployeeUncheckedCreateInput = {
        employeeNumber: createEmployeeDto.employeeNumber,
        firstName: createEmployeeDto.firstName,
        lastName: createEmployeeDto.lastName,
        email: createEmployeeDto.email,
        phone: createEmployeeDto.phone,
        hireDate: new Date(createEmployeeDto.hireDate),
        departmentId: createEmployeeDto.departmentId,
        managerId: createEmployeeDto.managerId,
        locationId: createEmployeeDto.locationId,
        userId: createEmployeeDto.userId,
        companyId: createEmployeeDto.companyId,
        status:
          createEmployeeDto.status as Prisma.EmployeeUncheckedCreateInput['status'],
      };

      if (dateOfBirthValue !== undefined && dateOfBirthValue !== '') {
        employeeData.dateOfBirth = new Date(dateOfBirthValue);
      }

      if (terminationDateValue !== undefined && terminationDateValue !== '') {
        employeeData.terminationDate = new Date(terminationDateValue);
      }

      if (createEmployeeDto.gender !== undefined) {
        employeeData.gender =
          createEmployeeDto.gender as Prisma.EmployeeUncheckedCreateInput['gender'];
      }

      if (address) {
        employeeData.address = address;
      }

      if (emergencyContact) {
        employeeData.emergencyContact = emergencyContact;
      }

      const employee = await this.prisma.employee.create({
        data: employeeData,
        include: this.getEmployeeInclude(),
      });

      return this.mapEmployee(employee);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Employee number or email already exists');
      }
      throw error;
    }
  }

  async findAll(
    pagination?: PaginationDto,
    filter?: FilterDto,
  ): Promise<PaginatedResponse<EmployeeResponseDto>> {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = pagination?.skip ?? 0;

    // Build where clause for search
    const where: Prisma.EmployeeWhereInput = {};
    if (filter?.search) {
      where.OR = [
        { firstName: { contains: filter.search, mode: 'insensitive' } },
        { lastName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { employeeNumber: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy clause for sorting
    let orderBy: Prisma.EmployeeOrderByWithRelationInput = { createdAt: 'desc' };
    if (filter?.sortBy) {
      const sortDirection = filter.sortOrder === SortOrder.ASC ? 'asc' : 'desc';
      orderBy = { [filter.sortBy]: sortDirection } as Prisma.EmployeeOrderByWithRelationInput;
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        include: this.getEmployeeInclude(),
        orderBy,
      }),
      this.prisma.employee.count({ where }),
    ]);

    return createPaginatedResponse(
      employees.map((employee) => this.mapEmployee(employee)),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: this.getEmployeeInclude(),
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return this.mapEmployee(employee);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        address: true,
        emergencyContact: true,
      },
    });

    if (!existingEmployee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    const addressUpdates = this.buildAddress(updateEmployeeDto);
    const emergencyUpdates = this.buildEmergencyContact(updateEmployeeDto);

    const address = addressUpdates
      ? {
          ...this.extractAddress(existingEmployee.address),
          ...addressUpdates,
        }
      : undefined;

    const emergencyContact = emergencyUpdates
      ? {
          ...this.extractEmergencyContact(existingEmployee.emergencyContact),
          ...emergencyUpdates,
        }
      : undefined;

    try {
      const updateData: Prisma.EmployeeUncheckedUpdateInput = {};

      if (updateEmployeeDto.employeeNumber !== undefined) {
        updateData.employeeNumber = updateEmployeeDto.employeeNumber;
      }
      if (updateEmployeeDto.firstName !== undefined) {
        updateData.firstName = updateEmployeeDto.firstName;
      }
      if (updateEmployeeDto.lastName !== undefined) {
        updateData.lastName = updateEmployeeDto.lastName;
      }
      if (updateEmployeeDto.email !== undefined) {
        updateData.email = updateEmployeeDto.email;
      }
      if (updateEmployeeDto.phone !== undefined) {
        updateData.phone = updateEmployeeDto.phone;
      }
      if (updateEmployeeDto.dateOfBirth !== undefined) {
        updateData.dateOfBirth = new Date(updateEmployeeDto.dateOfBirth);
      }
      if (updateEmployeeDto.gender !== undefined) {
        updateData.gender =
          updateEmployeeDto.gender as Prisma.EmployeeUncheckedUpdateInput['gender'];
      }
      if (address) {
        updateData.address = address;
      }
      if (emergencyContact) {
        updateData.emergencyContact = emergencyContact;
      }
      if (updateEmployeeDto.hireDate !== undefined) {
        updateData.hireDate = new Date(updateEmployeeDto.hireDate);
      }
      if (updateEmployeeDto.terminationDate !== undefined) {
        updateData.terminationDate = new Date(
          updateEmployeeDto.terminationDate,
        );
      }
      if (updateEmployeeDto.status !== undefined) {
        updateData.status =
          updateEmployeeDto.status as Prisma.EmployeeUncheckedUpdateInput['status'];
      }
      if (updateEmployeeDto.departmentId !== undefined) {
        updateData.departmentId = updateEmployeeDto.departmentId;
      }
      if (updateEmployeeDto.managerId !== undefined) {
        updateData.managerId = updateEmployeeDto.managerId;
      }
      if (updateEmployeeDto.locationId !== undefined) {
        updateData.locationId = updateEmployeeDto.locationId;
      }
      if (updateEmployeeDto.userId !== undefined) {
        updateData.userId = updateEmployeeDto.userId;
      }
      if (updateEmployeeDto.companyId !== undefined) {
        updateData.companyId = updateEmployeeDto.companyId;
      }

      const employee = await this.prisma.employee.update({
        where: { id },
        data: updateData,
        include: this.getEmployeeInclude(),
      });

      return this.mapEmployee(employee);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        throw new ConflictException('Employee number or email already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    await this.prisma.employee.delete({ where: { id } });
  }
}
