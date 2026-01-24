import { Test, type TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EmployeesService } from '../employees.service';
import { PrismaService } from '../../database/prisma.service';
import { mockPrismaService } from '../../../test/setup';
import {
  CreateEmployeeDto,
  EmploymentStatus,
} from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

describe('EmployeesService', () => {
  let service: EmployeesService;

  const prismaEmployee = {
    id: 'emp-1',
    employeeNumber: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'MALE',
    address: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    },
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1-555-0102',
    },
    hireDate: new Date('2024-01-01'),
    terminationDate: null,
    status: 'ACTIVE',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-03'),
    department: { id: 'dept-1', name: 'HR' },
    manager: { id: 'mgr-1', firstName: 'Jane', lastName: 'Smith' },
    location: {
      id: 'loc-1',
      name: 'HQ',
      address: { city: 'New York' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an employee and return mapped response', async () => {
    const createDto = Object.assign(new CreateEmployeeDto(), {
      employeeNumber: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0101',
      dateOfBirth: '1990-05-15',
      gender: 'MALE',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      hireDate: '2024-01-01',
      status: EmploymentStatus.ACTIVE,
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1-555-0102',
      departmentId: 'dept-1',
      managerId: 'mgr-1',
      locationId: 'loc-1',
      userId: 'user-1',
      companyId: 'company-1',
    });

    mockPrismaService.employee.create.mockResolvedValue(prismaEmployee);

    const result = await service.create(createDto);

    expect(mockPrismaService.employee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'MALE',
        address: {
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          phone: '+1-555-0102',
        },
        hireDate: new Date('2024-01-01'),
        status: EmploymentStatus.ACTIVE,
        departmentId: 'dept-1',
        managerId: 'mgr-1',
        locationId: 'loc-1',
        userId: 'user-1',
        companyId: 'company-1',
      }),
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        location: { select: { id: true, name: true, address: true } },
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'MALE',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        hireDate: new Date('2024-01-01'),
        status: EmploymentStatus.ACTIVE,
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0102',
        department: { id: 'dept-1', name: 'HR' },
        manager: { id: 'mgr-1', firstName: 'Jane', lastName: 'Smith' },
        location: { id: 'loc-1', name: 'HQ', city: 'New York' },
      }),
    );
  });

  it('should return all employees with mapped responses', async () => {
    mockPrismaService.employee.findMany.mockResolvedValue([prismaEmployee]);
    mockPrismaService.employee.count.mockResolvedValue(1);

    const result = await service.findAll();

    expect(mockPrismaService.employee.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 20,
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        location: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        address: '123 Main St',
        city: 'New York',
        emergencyContactName: 'Jane Doe',
        location: { id: 'loc-1', name: 'HQ', city: 'New York' },
      }),
    );
    expect(result.pagination).toEqual({
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    });
  });

  it('should throw NotFoundException when employee is missing', async () => {
    mockPrismaService.employee.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toThrow(
      NotFoundException,
    );

    expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-id' },
      include: {
        department: { select: { id: true, name: true } },
        manager: { select: { id: true, firstName: true, lastName: true } },
        location: { select: { id: true, name: true, address: true } },
      },
    });
  });

  it('should throw NotFoundException when updating missing employee', async () => {
    mockPrismaService.employee.findUnique.mockResolvedValue(null);

    await expect(
      service.update('missing-id', new UpdateEmployeeDto()),
    ).rejects.toThrow(NotFoundException);

    expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-id' },
      select: {
        address: true,
        emergencyContact: true,
      },
    });
  });
});
