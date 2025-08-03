# HR System Backend

A comprehensive Human Resources management system built with NestJS, PostgreSQL, and TypeScript. This system provides complete HR functionality including employee management, performance tracking, benefits administration, and organizational structure management.

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
- **Employee Management** - Complete employee lifecycle management
- **Company & Department Structure** - Organizational hierarchy management
- **Benefits Administration** - Employee benefits and enrollment
- **Performance Management** - Reviews, goals, and competency tracking
- **Training & Development** - Training programs and skill development
- **Time & Attendance** - Time tracking and attendance management
- **Document Management** - Employee documents and policy management
- **Announcements** - Company-wide communication system

### Technical Features
- **Authentication & Authorization** - JWT-based security with role-based access
- **RESTful API** - Comprehensive REST API with OpenAPI documentation
- **Database Management** - PostgreSQL with Prisma ORM
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Testing** - Comprehensive unit and e2e test suites
- **Monitoring** - Prometheus metrics and health checks
- **Docker Support** - Production-ready containerization

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
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Employee Management
- `GET /employees` - List all employees
- `POST /employees` - Create new employee
- `GET /employees/:id` - Get employee details
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Company & Department Management
- `GET /companies` - List companies
- `POST /companies` - Create company
- `GET /departments` - List departments
- `POST /departments` - Create department

### Benefits Administration
- `GET /benefits` - List benefits
- `POST /benefits` - Create benefit
- `POST /employees/:id/benefits` - Enroll employee in benefit

### Performance Management
- `GET /performance/reviews` - List reviews
- `POST /performance/reviews` - Create review
- `GET /goals` - List goals
- `POST /goals` - Create goal

Full API documentation available at: `http://localhost:3000/api/docs`

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
├── performance/          # Performance management
├── training/             # Training & development
├── time-tracking/        # Time tracking
├── documents/            # Document management
├── announcements/        # Company announcements
├── policies/             # Policy management
├── common/               # Shared utilities
├── config/               # Configuration
├── database/             # Database connection
└── security/             # Security middleware

test/
├── auth/                 # Auth tests
├── employees/            # Employee tests
├── companies/            # Company tests
└── ...                   # Other module tests

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
| Employees | `/employees` | GET/POST | List/Create employees |
| Employees | `/employees/:id` | GET/PUT/DELETE | Employee operations |
| Companies | `/companies` | GET/POST | List/Create companies |
| Departments | `/departments` | GET/POST | List/Create departments |
| Benefits | `/benefits` | GET/POST | List/Create benefits |
| Performance | `/performance/reviews` | GET/POST | Performance reviews |
| Training | `/training` | GET/POST | Training programs |
| Skills | `/skills` | GET/POST | Skills management |

For complete API documentation, visit: `http://localhost:3000/api/docs`
