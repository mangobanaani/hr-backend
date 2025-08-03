import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HR System database seeding...');

  try {
    // Create a sample company
    const company = await prisma.company.upsert({
      where: { id: 'company-1' },
      update: {},
      create: {
        id: 'company-1',
        name: 'TechCorp Solutions',
        industry: 'Technology',
        size: 'MEDIUM',
        address: '123 Tech Street',
        phone: '+1-555-TECH',
        email: 'info@techcorp.com',
        website: 'https://techcorp.com',
        description: 'Leading technology solutions provider',
      },
    });

    console.log('✅ Company created:', company.name);

    // Create sample locations
    const locations = await Promise.all([
      prisma.location.upsert({
        where: { id: 'loc-1' },
        update: {},
        create: {
          id: 'loc-1',
          name: 'San Francisco HQ',
          address: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94105',
          companyId: company.id,
        },
      }),
      prisma.location.upsert({
        where: { id: 'loc-2' },
        update: {},
        create: {
          id: 'loc-2',
          name: 'Austin Office',
          address: '456 Innovation Blvd',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301',
          companyId: company.id,
        },
      }),
    ]);

    console.log('✅ Locations created:', locations.length);

    // Create sample departments
    const departments = await Promise.all([
      prisma.department.upsert({
        where: { id: 'dept-1' },
        update: {},
        create: {
          id: 'dept-1',
          name: 'Engineering',
          description: 'Software development and technical operations',
          code: 'ENG',
          companyId: company.id,
        },
      }),
      prisma.department.upsert({
        where: { id: 'dept-2' },
        update: {},
        create: {
          id: 'dept-2',
          name: 'Human Resources',
          description: 'People operations and talent management',
          code: 'HR',
          companyId: company.id,
        },
      }),
      prisma.department.upsert({
        where: { id: 'dept-3' },
        update: {},
        create: {
          id: 'dept-3',
          name: 'Sales',
          description: 'Revenue generation and client relationships',
          code: 'SALES',
          companyId: company.id,
        },
      }),
    ]);

    console.log('✅ Departments created:', departments.length);

    // Create sample employees
    const employees = await Promise.all([
      prisma.employee.upsert({
        where: { id: 'emp-1' },
        update: {},
        create: {
          id: 'emp-1',
          employeeNumber: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@techcorp.com',
          phone: '+1-555-0101',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'MALE',
          maritalStatus: 'MARRIED',
          nationality: 'American',
          address: '789 Elm Street',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94110',
          hireDate: new Date('2022-01-15'),
          status: 'ACTIVE',
          companyId: company.id,
          departmentId: departments[0].id,
          locationId: locations[0].id,
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1-555-0102',
            email: 'jane.doe@email.com',
          },
        },
      }),
      prisma.employee.upsert({
        where: { id: 'emp-2' },
        update: {},
        create: {
          id: 'emp-2',
          employeeNumber: 'EMP002',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@techcorp.com',
          phone: '+1-555-0201',
          dateOfBirth: new Date('1985-08-22'),
          gender: 'FEMALE',
          maritalStatus: 'SINGLE',
          nationality: 'American',
          address: '456 Oak Avenue',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA',
          zipCode: '94115',
          hireDate: new Date('2021-03-10'),
          status: 'ACTIVE',
          companyId: company.id,
          departmentId: departments[1].id,
          locationId: locations[0].id,
          emergencyContact: {
            name: 'Robert Johnson',
            relationship: 'Father',
            phone: '+1-555-0202',
            email: 'robert.johnson@email.com',
          },
        },
      }),
      prisma.employee.upsert({
        where: { id: 'emp-3' },
        update: {},
        create: {
          id: 'emp-3',
          employeeNumber: 'EMP003',
          firstName: 'Michael',
          lastName: 'Chen',
          email: 'michael.chen@techcorp.com',
          phone: '+1-555-0301',
          dateOfBirth: new Date('1992-12-08'),
          gender: 'MALE',
          maritalStatus: 'SINGLE',
          nationality: 'American',
          address: '321 Pine Street',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '73301',
          hireDate: new Date('2023-06-01'),
          status: 'ACTIVE',
          companyId: company.id,
          departmentId: departments[2].id,
          locationId: locations[1].id,
          emergencyContact: {
            name: 'Linda Chen',
            relationship: 'Mother',
            phone: '+1-555-0302',
            email: 'linda.chen@email.com',
          },
        },
      }),
    ]);

    console.log('✅ Employees created:', employees.length);

    // Create sample benefits
    const benefits = await Promise.all([
      prisma.benefit.upsert({
        where: { id: 'benefit-1' },
        update: {},
        create: {
          id: 'benefit-1',
          name: 'Health Insurance',
          description: 'Comprehensive health insurance coverage for medical, dental, and vision.',
          type: 'HEALTH_INSURANCE',
          companyId: company.id,
          provider: 'Global Health Inc.',
          cost: 450.00,
          currency: 'USD',
        },
      }),
      prisma.benefit.upsert({
        where: { id: 'benefit-2' },
        update: {},
        create: {
          id: 'benefit-2',
          name: '401(k) Retirement Plan',
          description: 'Company-matched retirement savings plan with a 5% match.',
          type: 'RETIREMENT_401K',
          companyId: company.id,
          provider: 'Future Invest Co.',
          cost: 0.00,
          currency: 'USD',
        },
      }),
      prisma.benefit.upsert({
        where: { id: 'benefit-3' },
        update: {},
        create: {
          id: 'benefit-3',
          name: 'Paid Time Off (PTO)',
          description: '20 days of annual paid vacation and 10 days of sick leave.',
          type: 'VACATION',
          companyId: company.id,
          cost: 0.00,
          currency: 'USD',
        },
      }),
      prisma.benefit.upsert({
        where: { id: 'benefit-4' },
        update: {},
        create: {
          id: 'benefit-4',
          name: 'Life Insurance',
          description: 'Company-paid life insurance policy for all full-time employees.',
          type: 'LIFE_INSURANCE',
          companyId: company.id,
          provider: 'SecureLife Assurance',
          cost: 25.00,
          currency: 'USD',
        },
      }),
      prisma.benefit.upsert({
        where: { id: 'benefit-5' },
        update: {},
        create: {
          id: 'benefit-5',
          name: 'Wellness Program',
          description: 'Access to gym memberships, mental health resources, and wellness workshops.',
          type: 'OTHER',
          companyId: company.id,
          provider: 'Mind & Body Wellness',
          cost: 75.00,
          currency: 'USD',
        },
      }),
    ]);

    console.log('✅ Benefits created:', benefits.length);

    // First create job positions for the departments
    const jobPositions = await Promise.all([
      prisma.jobPosition.upsert({
        where: { id: 'job-1' },
        update: {},
        create: {
          id: 'job-1',
          title: 'Senior Software Engineer',
          description: 'Lead software development projects and mentor junior developers',
          level: 'SENIOR',
          department: departments[0].name, // Engineering
          companyId: company.id,
          minSalary: 110000,
          maxSalary: 130000,
        },
      }),
      prisma.jobPosition.upsert({
        where: { id: 'job-2' },
        update: {},
        create: {
          id: 'job-2',
          title: 'HR Manager',
          description: 'Manage HR operations and employee relations',
          level: 'MANAGER',
          department: departments[1].name, // HR
          companyId: company.id,
          minSalary: 85000,
          maxSalary: 105000,
        },
      }),
      prisma.jobPosition.upsert({
        where: { id: 'job-3' },
        update: {},
        create: {
          id: 'job-3',
          title: 'Sales Representative',
          description: 'Generate new business and maintain client relationships',
          level: 'MID',
          department: departments[2].name, // Sales
          companyId: company.id,
          minSalary: 65000,
          maxSalary: 85000,
        },
      }),
    ]);

    console.log('✅ Job positions created:', jobPositions.length);

    // Create employment records (job assignments)
    const employments = await Promise.all([
      prisma.employment.upsert({
        where: { id: 'emp-job-1' },
        update: {},
        create: {
          id: 'emp-job-1',
          employeeId: employees[0].id,
          jobPositionId: jobPositions[0].id,
          employmentType: 'FULL_TIME',
          workArrangement: 'HYBRID',
          startDate: new Date('2023-01-15'),
          hoursPerWeek: 40,
        },
      }),
      prisma.employment.upsert({
        where: { id: 'emp-job-2' },
        update: {},
        create: {
          id: 'emp-job-2',
          employeeId: employees[1].id,
          jobPositionId: jobPositions[1].id,
          employmentType: 'FULL_TIME',
          workArrangement: 'OFFICE',
          startDate: new Date('2022-06-01'),
          hoursPerWeek: 40,
        },
      }),
      prisma.employment.upsert({
        where: { id: 'emp-job-3' },
        update: {},
        create: {
          id: 'emp-job-3',
          employeeId: employees[2].id,
          jobPositionId: jobPositions[2].id,
          employmentType: 'FULL_TIME',
          workArrangement: 'REMOTE',
          startDate: new Date('2023-03-10'),
          hoursPerWeek: 40,
        },
      }),
    ]);

    console.log('✅ Employment records created:', employments.length);

    // Enroll employees in benefits
    const employeeBenefits = await Promise.all([
      // John Doe - All benefits
      prisma.employeeBenefit.upsert({
        where: { id: 'emp-ben-1' },
        update: {},
        create: {
          id: 'emp-ben-1',
          employeeId: employees[0].id,
          benefitId: benefits[0].id, // Health Insurance
          startDate: new Date('2023-01-15'),
        },
      }),
      prisma.employeeBenefit.upsert({
        where: { id: 'emp-ben-2' },
        update: {},
        create: {
          id: 'emp-ben-2',
          employeeId: employees[0].id,
          benefitId: benefits[1].id, // 401k
          startDate: new Date('2023-01-15'),
        },
      }),
      // Sarah Johnson - Health and PTO
      prisma.employeeBenefit.upsert({
        where: { id: 'emp-ben-3' },
        update: {},
        create: {
          id: 'emp-ben-3',
          employeeId: employees[1].id,
          benefitId: benefits[0].id, // Health Insurance
          startDate: new Date('2022-06-01'),
        },
      }),
      prisma.employeeBenefit.upsert({
        where: { id: 'emp-ben-4' },
        update: {},
        create: {
          id: 'emp-ben-4',
          employeeId: employees[1].id,
          benefitId: benefits[2].id, // PTO
          startDate: new Date('2022-06-01'),
        },
      }),
    ]);

    console.log('✅ Employee benefit enrollments created:', employeeBenefits.length);

    // Create salary records
    const salaries = await Promise.all([
      prisma.salary.upsert({
        where: { id: 'sal-1' },
        update: {},
        create: {
          id: 'sal-1',
          employeeId: employees[0].id,
          amount: 120000,
          currency: 'USD',
          frequency: 'ANNUALLY',
          effectiveDate: new Date('2023-01-15'),
          salaryType: 'BASE',
        },
      }),
      prisma.salary.upsert({
        where: { id: 'sal-2' },
        update: {},
        create: {
          id: 'sal-2',
          employeeId: employees[1].id,
          amount: 95000,
          currency: 'USD',
          frequency: 'ANNUALLY',
          effectiveDate: new Date('2022-06-01'),
          salaryType: 'BASE',
        },
      }),
      prisma.salary.upsert({
        where: { id: 'sal-3' },
        update: {},
        create: {
          id: 'sal-3',
          employeeId: employees[2].id,
          amount: 75000,
          currency: 'USD',
          frequency: 'ANNUALLY',
          effectiveDate: new Date('2023-03-10'),
          salaryType: 'BASE',
        },
      }),
    ]);

    console.log('✅ Salary records created:', salaries.length);

    // Create some projects
    const projects = await Promise.all([
      prisma.project.upsert({
        where: { id: 'proj-1' },
        update: {},
        create: {
          id: 'proj-1',
          name: 'Mobile App Development',
          description: 'Development of the company mobile application',
          status: 'IN_PROGRESS',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
        },
      }),
      prisma.project.upsert({
        where: { id: 'proj-2' },
        update: {},
        create: {
          id: 'proj-2',
          name: 'HR System Implementation',
          description: 'Implementation of new HR management system',
          status: 'COMPLETED',
          startDate: new Date('2023-06-01'),
          endDate: new Date('2024-01-31'),
        },
      }),
    ]);

    console.log('✅ Projects created:', projects.length);

    // Create some skills
    const skills = await Promise.all([
      prisma.skill.upsert({
        where: { id: 'skill-1' },
        update: {},
        create: {
          id: 'skill-1',
          name: 'JavaScript',
          category: 'Programming',
        },
      }),
      prisma.skill.upsert({
        where: { id: 'skill-2' },
        update: {},
        create: {
          id: 'skill-2',
          name: 'Project Management',
          category: 'Management',
        },
      }),
      prisma.skill.upsert({
        where: { id: 'skill-3' },
        update: {},
        create: {
          id: 'skill-3',
          name: 'Sales Strategy',
          category: 'Sales',
        },
      }),
    ]);

    console.log('✅ Skills created:', skills.length);

    // Create employee skills
    const employeeSkills = await Promise.all([
      prisma.employeeSkill.upsert({
        where: { id: 'emp-skill-1' },
        update: {},
        create: {
          id: 'emp-skill-1',
          employeeId: employees[0].id, // John Doe
          skillId: skills[0].id, // JavaScript
          level: 'EXPERT',
        },
      }),
      prisma.employeeSkill.upsert({
        where: { id: 'emp-skill-2' },
        update: {},
        create: {
          id: 'emp-skill-2',
          employeeId: employees[1].id, // Sarah Johnson
          skillId: skills[1].id, // Project Management
          level: 'ADVANCED',
        },
      }),
    ]);

    console.log('✅ Employee skills created:', employeeSkills.length);

    // Create some time tracking records
    const timeRecords = await Promise.all([
      prisma.timeRecord.upsert({
        where: { id: 'time-1' },
        update: {},
        create: {
          id: 'time-1',
          employeeId: employees[0].id,
          date: new Date('2024-08-01'),
          clockIn: new Date('2024-08-01T09:00:00'),
          clockOut: new Date('2024-08-01T17:00:00'),
          totalHours: 8,
          notes: 'Mobile app frontend development',
          status: 'APPROVED',
        },
      }),
      prisma.timeRecord.upsert({
        where: { id: 'time-2' },
        update: {},
        create: {
          id: 'time-2',
          employeeId: employees[0].id,
          date: new Date('2024-08-02'),
          clockIn: new Date('2024-08-02T09:00:00'),
          clockOut: new Date('2024-08-02T16:30:00'),
          totalHours: 7.5,
          notes: 'API integration work',
          status: 'PENDING',
        },
      }),
    ]);

    console.log('✅ Time records created:', timeRecords.length);

    // Create performance reviews
    const performanceReviews = await Promise.all([
      prisma.performanceReview.upsert({
        where: { id: 'perf-1' },
        update: {},
        create: {
          id: 'perf-1',
          employeeId: employees[0].id,
          reviewerId: employees[1].id, // Sarah reviews John
          period: '2023-Annual',
          type: 'ANNUAL',
          overallRating: 4.5,
          status: 'COMPLETED',
          dueDate: new Date('2024-01-31'),
          reviewDate: new Date('2024-01-15'),
        },
      }),
    ]);

    console.log('✅ Performance reviews created:', performanceReviews.length);

    console.log('🎯 Basic seed data completed!');
    console.log('📊 Ready to test the performance management system');

    // Create a test user for authentication
    const testEmail = 'user@example.com';
    const testPassword = 'password123';
    const testHashedPassword = await bcrypt.hash(testPassword, 12);
    const testUser = await prisma.user.upsert({
      where: { email: testEmail },
      update: { password: testHashedPassword, isActive: true },
      create: {
        email: testEmail,
        password: testHashedPassword,
        isActive: true,
      },
    });
    console.log('✅ Test user created:', testUser.email);

    console.log('🎉 HR System database seeding completed successfully!');
    console.log(`
📊 Summary:
- 1 Company: ${company.name}
- ${locations.length} Locations
- ${departments.length} Departments  
- ${jobPositions.length} Job Positions
- ${employees.length} Employees
- ${benefits.length} Benefits
- ${employments.length} Employment Records
- ${employeeBenefits.length} Benefit Enrollments
- ${salaries.length} Salary Records
- ${projects.length} Projects
- ${skills.length} Skills
- ${employeeSkills.length} Employee Skills
- ${timeRecords.length} Time Records
- ${performanceReviews.length} Performance Reviews
`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
