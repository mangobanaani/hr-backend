import { validate } from 'class-validator';
import {
  CreateEmployeeDto,
  EmploymentStatus,
} from '../dto/create-employee.dto';

describe('CreateEmployeeDto', () => {
  const baseDto = {
    employeeNumber: 'EMP001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    hireDate: '2024-01-01',
    status: EmploymentStatus.ACTIVE,
  };

  it('requires companyId', async () => {
    const dto = Object.assign(new CreateEmployeeDto(), baseDto);

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'companyId')).toBe(true);
  });

  it('passes validation when companyId is provided', async () => {
    const dto = Object.assign(new CreateEmployeeDto(), {
      ...baseDto,
      companyId: 'company-1',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });
});
