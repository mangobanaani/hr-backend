import 'reflect-metadata';
import { ROLES_KEY } from '../guards/roles.decorator';
import { AnnouncementsController } from '../../announcements/announcements.controller';
import { BenefitsController } from '../../benefits/benefits.controller';
import { CompaniesController } from '../../companies/companies.controller';
import { DepartmentsController } from '../../departments/departments.controller';
import { DocumentsController } from '../../documents/documents.controller';
import { EmployeeSkillsController } from '../../employee-skills/employee-skills.controller';
import { EmployeesController } from '../../employees/employees.controller';
import { ExpensesController } from '../../expenses/expenses.controller';
import { GoalsController } from '../../goals/goals.controller';
import { PerformanceController } from '../../performance/performance.controller';
import { PoliciesController } from '../../policies/policies.controller';
import { ProjectsController } from '../../projects/projects.controller';
import { SkillsController } from '../../skills/skills.controller';
import { TimeTrackingController } from '../../time-tracking/time-tracking.controller';
import { TrainingController } from '../../training/training.controller';

interface ControllerCase {
  controller: {
    prototype: Record<PropertyKey, unknown>;
    name: string;
  };
  methods: string[];
}

describe('Roles metadata on write endpoints', () => {
  const cases: ControllerCase[] = [
    {
      controller:
        AnnouncementsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller: BenefitsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        CompaniesController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        DepartmentsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        DocumentsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        EmployeeSkillsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        EmployeesController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'replace', 'remove'],
    },
    {
      controller: ExpensesController as unknown as ControllerCase['controller'],
      methods: [
        'create',
        'update',
        'approve',
        'reject',
        'remove',
        'createCategory',
        'updateCategory',
        'removeCategory',
      ],
    },
    {
      controller: GoalsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'updateProgress', 'remove'],
    },
    {
      controller:
        PerformanceController as unknown as ControllerCase['controller'],
      methods: [
        'createCycle',
        'updateCycle',
        'removeCycle',
        'createReview',
        'updateReview',
        'submitReview',
        'completeReview',
        'removeReview',
      ],
    },
    {
      controller: PoliciesController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller: ProjectsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove', 'assignTeam', 'removeTeam'],
    },
    {
      controller: SkillsController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
    {
      controller:
        TimeTrackingController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'approve', 'reject', 'remove'],
    },
    {
      controller: TrainingController as unknown as ControllerCase['controller'],
      methods: ['create', 'update', 'remove'],
    },
  ];

  it('requires admin role for write methods', () => {
    for (const { controller, methods } of cases) {
      const controllerName = controller.name;
      for (const method of methods) {
        const handler = (controller as { prototype: Record<string, unknown> })
          .prototype[method];
        const metadata = Reflect.getMetadata(ROLES_KEY, handler as object) as
          | string[]
          | undefined;
        if (!metadata) {
          throw new Error(
            `Missing roles metadata on ${controllerName}.${method}`,
          );
        }
        expect(metadata).toEqual(['admin']);
      }
    }
  });
});
