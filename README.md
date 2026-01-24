# HR System Backend

A comprehensive Human Resources management system built with NestJS, PostgreSQL, and TypeScript. This production-ready system provides complete HR functionality including employee management, performance tracking, benefits administration, and organizational structure management.

## Overview

This is a full-featured HR backend API with comprehensive test coverage (35 passing tests), complete Swagger documentation for all endpoints, and production-grade security including JWT authentication, role-based access control, and comprehensive input validation.

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [System Overview](#system-overview)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)

## Features

### Core HR Modules
- **Employee Management** - Complete employee lifecycle management with full CRUD operations
- **Company & Department Structure** - Organizational hierarchy management with nested departments
- **Benefits Administration** - Employee benefits enrollment and category management
- **Performance Management** - Performance cycles, reviews, and ratings with approval workflows
- **Goals Management** - Employee goal setting, tracking, and progress monitoring
- **Training & Development** - Training programs, skill tracking, and employee development
- **Time & Attendance** - Time tracking with automatic hour calculations and approval workflows
- **Expense Management** - Expense reports, reimbursements, and category limits with approval process
- **Project Management** - Project tracking, team assignments, and budget management
- **Document Management** - Employee documents and policy management
- **Announcements** - Company-wide communication system
- **Skills Management** - Employee skills tracking and competency management

### Technical Features
- **Authentication & Authorization** - JWT-based security with role-based access control
- **RESTful API** - Comprehensive REST API with 100% OpenAPI/Swagger documentation
- **Database Management** - PostgreSQL with Prisma ORM for type-safe database access
- **Security** - Helmet, CORS, rate limiting, and comprehensive input validation
- **Validation** - Class-validator for DTO validation on all endpoints
- **Error Handling** - Consistent error responses with proper HTTP status codes
- **Testing** - Unit tests with Jest (35/35 passing)
- **TypeScript** - Fully typed codebase with strict mode enabled
- **Docker Support** - Production-ready containerization with security hardening
- **Code Quality** - ESLint and Prettier configured for consistent code style

## Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application]
        MOBILE[Mobile App]
        API_CLIENT[API Clients]
    end

    subgraph "API Gateway"
        NGINX[Nginx Load Balancer]
    end

    subgraph "Application Layer"
        AUTH[Authentication Service]
        HR_API[HR System API]
        SWAGGER[API Documentation]
    end

    subgraph "Business Logic"
        EMP[Employee Module]
        COMP[Company Module]
        PERF[Performance Module]
        TRAIN[Training Module]
        BENEFIT[Benefits Module]
        TIME[Time Tracking Module]
    end

    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        POSTGRES[(PostgreSQL Database)]
        REDIS[(Redis Cache)]
    end

    subgraph "External Services"
        EMAIL[Email Service]
        STORAGE[File Storage]
        MONITORING[Monitoring]
    end

    WEB --> NGINX
    MOBILE --> NGINX
    API_CLIENT --> NGINX

    NGINX --> AUTH
    NGINX --> HR_API
    NGINX --> SWAGGER

    AUTH --> EMP
    HR_API --> EMP
    HR_API --> COMP
    HR_API --> PERF
    HR_API --> TRAIN
    HR_API --> BENEFIT
    HR_API --> TIME

    EMP --> PRISMA
    COMP --> PRISMA
    PERF --> PRISMA
    TRAIN --> PRISMA
    BENEFIT --> PRISMA
    TIME --> PRISMA

    PRISMA --> POSTGRES
    HR_API --> REDIS

    HR_API --> EMAIL
    HR_API --> STORAGE
    HR_API --> MONITORING
```

## System Overview

```mermaid
graph LR
    subgraph "HR System Core"
        USER[User Management]
        COMPANY[Company Structure]
        EMPLOYEE[Employee Management]
        DEPARTMENT[Department Management]
    end

    subgraph "HR Operations"
        PERFORMANCE[Performance Management]
        TRAINING[Training & Development]
        BENEFITS[Benefits Administration]
        TIME[Time & Attendance]
    end

    subgraph "Support Systems"
        DOCUMENTS[Document Management]
        ANNOUNCEMENTS[Announcements]
        POLICIES[Policy Management]
        SECURITY[Security & Compliance]
    end

    USER --> EMPLOYEE
    COMPANY --> DEPARTMENT
    DEPARTMENT --> EMPLOYEE
    EMPLOYEE --> PERFORMANCE
    EMPLOYEE --> TRAINING
    EMPLOYEE --> BENEFITS
    EMPLOYEE --> TIME
    EMPLOYEE --> DOCUMENTS
    COMPANY --> ANNOUNCEMENTS
    COMPANY --> POLICIES
    USER --> SECURITY
```

## Database Schema

### Core Entities Relationship

```mermaid
erDiagram
    User ||--o| Employee : has
    User ||--o{ UserRole : has
    Role ||--o{ UserRole : assigned
    
    Company ||--o{ Department : contains
    Company ||--o{ Employee : employs
    Company ||--o{ Benefit : offers
    Company ||--o{ JobPosition : has
    
    Department ||--o{ Employee : contains
    Department ||--o| Department : parent
    
    Employee ||--o{ PerformanceReview : receives
    Employee ||--o{ Goal : sets
    Employee ||--o{ TrainingEnrollment : enrolls
    Employee ||--o{ EmployeeBenefit : receives
    Employee ||--o{ TimeEntry : logs
    Employee ||--o{ Document : owns
    
    JobPosition ||--o{ Employee : assigned
    
    Benefit ||--o{ EmployeeBenefit : enrolled
    
    Training ||--o{ TrainingEnrollment : has
    Training ||--o{ Skill : teaches
    
    Skill ||--o{ EmployeeSkill : possessed
    
    Project ||--o{ ProjectMember : has
    Employee ||--o{ ProjectMember : participates
```

### Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth
    participant DB
    participant Cache

    Client->>API: POST /auth/login
    API->>Auth: Validate credentials
    Auth->>DB: Check user & password
    DB-->>Auth: User data
    Auth->>Cache: Store session
    Auth-->>API: JWT tokens
    API-->>Client: Access & refresh tokens

    Client->>API: GET /employees (with JWT)
    API->>Auth: Validate JWT
    Auth->>Cache: Check session
    Cache-->>Auth: Session valid
    Auth->>DB: Check permissions
    DB-->>Auth: User roles
    Auth-->>API: Authorized
    API->>DB: Fetch employees
    DB-->>API: Employee data
    API-->>Client: Employee list
```

## API Documentation

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Refresh access token (Authorization: `Bearer <refresh_token>`)
- `POST /auth/logout` - Logout (Authorization: `Bearer <refresh_token>`)
- `GET /auth/profile` - Current user profile

> **RBAC:** All write endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) require the `admin` role. Read endpoints (`GET`) require authentication.

### Employee Management
- `GET /employees` - List all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee details
- `PATCH /employees/:id` - Update employee (partial)
- `PUT /employees/:id` - Update employee (full replacement)
- `DELETE /employees/:id` - Delete employee

### Company Management
- `GET /companies` - List companies
- `POST /companies` - Create company
- `GET /companies/:id` - Get company details
- `PATCH /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company

### Department Management
- `GET /departments` - List departments
- `POST /departments` - Create department
- `GET /departments/:id` - Get department details
- `PATCH /departments/:id` - Update department
- `DELETE /departments/:id` - Delete department

### Benefits Administration
- `GET /benefits` - List benefits
- `POST /benefits` - Create benefit
- `GET /benefits/:id` - Get benefit details
- `PATCH /benefits/:id` - Update benefit
- `DELETE /benefits/:id` - Delete benefit
- `POST /benefits/:id/enrollments` - Enroll employee in benefit
- `GET /benefits/:id/enrollments` - List benefit enrollments
- `PATCH /benefits/:id/enrollments/:enrollmentId` - Update benefit enrollment
- `DELETE /benefits/:id/enrollments/:enrollmentId` - Remove benefit enrollment

### Performance Management
- `GET /performance/cycles` - List performance cycles
- `POST /performance/cycles` - Create performance cycle
- `GET /performance/cycles/:id` - Get performance cycle
- `PATCH /performance/cycles/:id` - Update performance cycle
- `DELETE /performance/cycles/:id` - Delete performance cycle
- `GET /performance/reviews` - List performance reviews
- `POST /performance/reviews` - Create performance review
- `GET /performance/reviews/:id` - Get performance review
- `PATCH /performance/reviews/:id` - Update performance review
- `PATCH /performance/reviews/:id/submit` - Submit review for approval
- `PATCH /performance/reviews/:id/complete` - Complete review
- `DELETE /performance/reviews/:id` - Delete performance review

### Goals Management
- `GET /goals` - List goals
- `POST /goals` - Create goal
- `GET /goals/:id` - Get goal details
- `PATCH /goals/:id` - Update goal
- `PATCH /goals/:id/progress` - Update goal progress
- `DELETE /goals/:id` - Delete goal

### Training & Development
- `GET /training` - List training programs
- `POST /training` - Create training
- `GET /training/:id` - Get training
- `PATCH /training/:id` - Update training
- `DELETE /training/:id` - Delete training

### Time Tracking
- `GET /time-tracking` - List time entries with filters
- `POST /time-tracking` - Create time entry
- `GET /time-tracking/:id` - Get time entry
- `PATCH /time-tracking/:id` - Update time entry
- `PATCH /time-tracking/:id/approve` - Approve time entry
- `PATCH /time-tracking/:id/reject` - Reject time entry
- `DELETE /time-tracking/:id` - Delete time entry

### Expense Management
- `GET /expenses` - List expenses
- `POST /expenses` - Create expense
- `GET /expenses/:id` - Get expense
- `PATCH /expenses/:id` - Update expense
- `PATCH /expenses/:id/approve` - Approve expense
- `PATCH /expenses/:id/reject` - Reject expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/categories` - List expense categories
- `POST /expenses/categories` - Create expense category
- `GET /expenses/categories/:id` - Get expense category
- `PATCH /expenses/categories/:id` - Update expense category
- `DELETE /expenses/categories/:id` - Delete expense category

### Project Management
- `GET /projects` - List projects
- `POST /projects` - Create project
- `GET /projects/:id` - Get project
- `PATCH /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:projectId/teams/:teamId` - Assign team to project
- `DELETE /projects/:projectId/teams/:teamId` - Remove team from project

### Document Management
- `GET /documents` - List documents
- `POST /documents` - Create document
- `GET /documents/:id` - Get document
- `PATCH /documents/:id` - Update document
- `DELETE /documents/:id` - Delete document

### Policy Management
- `GET /policies` - List policies
- `POST /policies` - Create policy
- `GET /policies/:id` - Get policy
- `PATCH /policies/:id` - Update policy
- `DELETE /policies/:id` - Delete policy

### Announcements
- `GET /announcements` - List announcements
- `POST /announcements` - Create announcement
- `GET /announcements/:id` - Get announcement
- `PATCH /announcements/:id` - Update announcement
- `DELETE /announcements/:id` - Delete announcement

### Skills Management
- `GET /skills` - List skills
- `POST /skills` - Create skill
- `GET /skills/categories` - List skill categories
- `GET /skills/:id` - Get skill
- `PATCH /skills/:id` - Update skill
- `DELETE /skills/:id` - Delete skill

### Employee Skills
- `GET /employee-skills` - List employee skills
- `POST /employee-skills` - Create employee skill
- `GET /employee-skills/employee/:employeeId` - List skills for an employee
- `GET /employee-skills/:id` - Get employee skill
- `PATCH /employee-skills/:id` - Update employee skill
- `DELETE /employee-skills/:id` - Delete employee skill

**Full interactive API documentation with Swagger UI available at: `http://localhost:3000/api/docs`**

All endpoints include:
- Complete request/response schemas
- JWT Bearer authentication
- Input validation with class-validator
- Comprehensive error handling
- Detailed API descriptions

## Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Redis (optional, for caching)
- Docker and Docker Compose (for containerized deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-system-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb hr_system
   
   # Run migrations
   npx prisma migrate dev
   
   # Seed initial data (optional)
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000/api/v1`

## Configuration

### Environment Variables

Create a `.env` file from `.env.example` and configure:

#### Database Configuration
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/hr_system"
DB_HOST="localhost"
DB_PORT=5432
DB_USERNAME="postgres"
DB_PASSWORD="your-password"
DB_DATABASE="hr_system"
```

#### JWT Configuration
```bash
JWT_SECRET="your-super-secure-jwt-secret-minimum-64-characters"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
```

#### Server Configuration
```bash
NODE_ENV="development"
PORT=3000
HOST="0.0.0.0"
API_PREFIX="api/v1"
```

## Development

### Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start with debugging enabled
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:cov` - Run tests with coverage

### Project Structure

```
src/
├── auth/                 # Authentication & authorization
├── employees/            # Employee management
├── companies/            # Company management
├── departments/          # Department management
├── benefits/             # Benefits administration
├── performance/          # Performance cycles & reviews
├── goals/                # Goal management
├── training/             # Training & development
├── skills/               # Skills management
├── employee-skills/      # Employee skills tracking
├── time-tracking/        # Time tracking
├── expenses/             # Expense management
├── projects/             # Project management
├── documents/            # Document management
├── announcements/        # Company announcements
├── policies/             # Policy management
├── common/               # Shared utilities
├── config/               # Configuration
├── database/             # Database connection
└── security/             # Security middleware

test/
├── auth/                 # Authentication tests
├── employees/            # Employee tests
├── departments/          # Department tests
├── skills/               # Skills tests
├── training/             # Training tests
└── database/             # Database tests

prisma/
├── schema.prisma         # Database schema
├── migrations/           # Database migrations
└── seed.ts              # Database seeding
```

## Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

### Test Structure
- **Unit Tests**: Located alongside source files (`*.spec.ts`)
- **E2E Tests**: Located in `test/` directory (`*.e2e-spec.ts`)
- **Test Database**: Uses separate test database for e2e tests

## Deployment

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **Production deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

3. **Start the production server**
   ```bash
   npm run start:prod
   ```

### Environment-Specific Configurations
- **Development**: Local database, debug logging, hot reload
- **Staging**: Production-like environment for testing
- **Production**: Optimized build, security hardening, monitoring

## Security

### Security Features
- **JWT Authentication** with refresh tokens
- **Role-based Authorization** for endpoint access
- **Input Validation** using class-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **Password Hashing** with bcrypt
- **SQL Injection Protection** via Prisma ORM

### Security Best Practices
- Use strong JWT secrets (64+ characters)
- Enable HTTPS in production
- Regular security updates
- Environment variable protection
- Database connection encryption
- Audit logging for sensitive operations

## Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

### Code Standards
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Jest** for testing

### Pull Request Process
1. Ensure all tests pass
2. Update documentation if needed
3. Follow the existing code style
4. Include appropriate test coverage
5. Add a descriptive commit message

---

## API Endpoints Summary

| Module | Endpoint | Method | Description |
|--------|----------|---------|-------------|
| Auth | `/auth/login` | POST | User login |
| Auth | `/auth/refresh` | POST | Refresh token |
| Auth | `/auth/logout` | POST | User logout |
| Auth | `/auth/profile` | GET | Current user profile |
| Employees | `/employees` | GET/POST | List/Create employees |
| Employees | `/employees/:id` | GET/PATCH/PUT/DELETE | Employee operations |
| Companies | `/companies` | GET/POST | List/Create companies |
| Companies | `/companies/:id` | GET/PATCH/DELETE | Company operations |
| Departments | `/departments` | GET/POST | List/Create departments |
| Departments | `/departments/:id` | GET/PATCH/DELETE | Department operations |
| Benefits | `/benefits` | GET/POST | List/Create benefits |
| Benefits | `/benefits/:id` | GET/PATCH/DELETE | Benefit operations |
| Benefits | `/benefits/:id/enrollments` | GET/POST | Benefit enrollments |
| Benefits | `/benefits/:id/enrollments/:enrollmentId` | PATCH/DELETE | Enrollment updates |
| Performance | `/performance/cycles` | GET/POST | Performance cycles |
| Performance | `/performance/cycles/:id` | GET/PATCH/DELETE | Cycle operations |
| Performance | `/performance/reviews` | GET/POST | Performance reviews |
| Performance | `/performance/reviews/:id` | GET/PATCH/DELETE | Review operations |
| Performance | `/performance/reviews/:id/submit` | PATCH | Submit review |
| Performance | `/performance/reviews/:id/complete` | PATCH | Complete review |
| Goals | `/goals` | GET/POST | Employee goals |
| Goals | `/goals/:id` | GET/PATCH/DELETE | Goal operations |
| Goals | `/goals/:id/progress` | PATCH | Goal progress |
| Time Tracking | `/time-tracking` | GET/POST | Time entries |
| Time Tracking | `/time-tracking/:id` | GET/PATCH/DELETE | Time entry operations |
| Time Tracking | `/time-tracking/:id/approve` | PATCH | Approve time entry |
| Time Tracking | `/time-tracking/:id/reject` | PATCH | Reject time entry |
| Expenses | `/expenses` | GET/POST | Expense reports |
| Expenses | `/expenses/:id` | GET/PATCH/DELETE | Expense operations |
| Expenses | `/expenses/:id/approve` | PATCH | Approve expense |
| Expenses | `/expenses/:id/reject` | PATCH | Reject expense |
| Expenses | `/expenses/categories` | GET/POST | Expense categories |
| Expenses | `/expenses/categories/:id` | GET/PATCH/DELETE | Expense category operations |
| Projects | `/projects` | GET/POST | Project management |
| Projects | `/projects/:id` | GET/PATCH/DELETE | Project operations |
| Projects | `/projects/:projectId/teams/:teamId` | POST/DELETE | Team assignments |
| Training | `/training` | GET/POST | Training programs |
| Training | `/training/:id` | GET/PATCH/DELETE | Training operations |
| Documents | `/documents` | GET/POST | Documents |
| Documents | `/documents/:id` | GET/PATCH/DELETE | Document operations |
| Policies | `/policies` | GET/POST | Policies |
| Policies | `/policies/:id` | GET/PATCH/DELETE | Policy operations |
| Announcements | `/announcements` | GET/POST | Announcements |
| Announcements | `/announcements/:id` | GET/PATCH/DELETE | Announcement operations |
| Skills | `/skills` | GET/POST | Skills management |
| Skills | `/skills/categories` | GET | Skill categories |
| Skills | `/skills/:id` | GET/PATCH/DELETE | Skill operations |
| Employee Skills | `/employee-skills` | GET/POST | Employee skills |
| Employee Skills | `/employee-skills/employee/:employeeId` | GET | Employee skill list |
| Employee Skills | `/employee-skills/:id` | GET/PATCH/DELETE | Employee skill operations |

For complete API documentation, visit: `http://localhost:3000/api/docs`
