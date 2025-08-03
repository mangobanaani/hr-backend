-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HR_MANAGER', 'MANAGER', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('ENGINEERING', 'PRODUCT', 'DESIGN', 'MARKETING', 'SALES', 'HR', 'FINANCE', 'OPERATIONS', 'LEGAL', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "SalaryFrequency" AS ENUM ('HOURLY', 'WEEKLY', 'MONTHLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('ANNUAL', 'QUARTERLY', 'PROJECT_BASED', 'PROBATIONARY', 'EXIT');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('PERFORMANCE', 'DEVELOPMENT', 'CAREER', 'PROJECT', 'COMPANY');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "TrainingStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VACATION', 'SICK', 'PERSONAL', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'JURY_DUTY', 'MILITARY');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('TRAVEL', 'MEALS', 'OFFICE_SUPPLIES', 'SOFTWARE', 'TRAINING', 'ENTERTAINMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'POLICY', 'HANDBOOK', 'FORM', 'CERTIFICATE', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('HR', 'SECURITY', 'SAFETY', 'COMPLIANCE', 'OPERATIONAL', 'CODE_OF_CONDUCT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expires" TIMESTAMP(3),
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verification_token" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "industry" TEXT,
    "size" "CompanySize" NOT NULL DEFAULT 'MEDIUM',
    "founded_year" INTEGER,
    "headquarters" TEXT,
    "logo_url" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_number" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "display_name" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "gender" TEXT,
    "nationality" TEXT,
    "phone" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "profile_picture_url" TEXT,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "department" "Department" NOT NULL,
    "position_title" TEXT NOT NULL,
    "manager_id" TEXT,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "termination_date" TIMESTAMP(3),
    "termination_reason" TEXT,
    "work_location" TEXT,
    "work_hours_per_week" DECIMAL(4,2) DEFAULT 40.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "level" "SkillLevel" NOT NULL DEFAULT 'BEGINNER',
    "years_of_experience" INTEGER,
    "certified" BOOLEAN NOT NULL DEFAULT false,
    "certification_date" TIMESTAMP(3),
    "certification_expiry" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compensation" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "salary_amount" DECIMAL(12,2) NOT NULL,
    "salary_currency" TEXT NOT NULL DEFAULT 'USD',
    "salary_frequency" "SalaryFrequency" NOT NULL DEFAULT 'ANNUALLY',
    "bonus_amount" DECIMAL(12,2),
    "equity_amount" DECIMAL(12,2),
    "effective_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "review_period_start" TIMESTAMP(3) NOT NULL,
    "review_period_end" TIMESTAMP(3) NOT NULL,
    "review_type" "ReviewType" NOT NULL DEFAULT 'ANNUAL',
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "overall_rating" DECIMAL(3,2),
    "goals_rating" DECIMAL(3,2),
    "competencies_rating" DECIMAL(3,2),
    "summary" TEXT,
    "achievements" TEXT,
    "areas_for_improvement" TEXT,
    "development_plan" TEXT,
    "employee_comments" TEXT,
    "reviewer_comments" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "performance_review_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoalCategory" NOT NULL DEFAULT 'PERFORMANCE',
    "target_value" DECIMAL(10,2),
    "current_value" DECIMAL(10,2) DEFAULT 0,
    "measurement_unit" TEXT,
    "weight" DECIMAL(3,2) DEFAULT 1.0,
    "due_date" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completion_percentage" INTEGER DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "provider" TEXT,
    "duration_hours" DECIMAL(6,2),
    "cost" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'USD',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "status" "TrainingStatus" NOT NULL DEFAULT 'ASSIGNED',
    "certification_earned" BOOLEAN DEFAULT false,
    "certificate_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Training_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leave" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days_requested" DECIMAL(4,2) NOT NULL,
    "reason" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeRecord" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clock_in" TIMESTAMP(3),
    "clock_out" TIMESTAMP(3),
    "break_duration_minutes" INTEGER DEFAULT 0,
    "total_hours" DECIMAL(4,2),
    "overtime_hours" DECIMAL(4,2) DEFAULT 0,
    "project" TEXT,
    "description" TEXT,
    "location" TEXT,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "description" TEXT NOT NULL,
    "receipt_url" TEXT,
    "expense_date" TIMESTAMP(3) NOT NULL,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "reimbursed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT,
    "company_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "expiry_date" TIMESTAMP(3),
    "version" TEXT DEFAULT '1.0',
    "uploaded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PolicyType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "effective_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "requires_acknowledgment" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAcknowledgment" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "policy_id" TEXT NOT NULL,
    "acknowledged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,

    CONSTRAINT "PolicyAcknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_is_active_idx" ON "User"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_size_idx" ON "Company"("size");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "Company"("industry");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_number_key" ON "Employee"("employee_number");

-- CreateIndex
CREATE INDEX "Employee_company_id_idx" ON "Employee"("company_id");

-- CreateIndex
CREATE INDEX "Employee_department_idx" ON "Employee"("department");

-- CreateIndex
CREATE INDEX "Employee_employment_status_idx" ON "Employee"("employment_status");

-- CreateIndex
CREATE INDEX "Employee_manager_id_idx" ON "Employee"("manager_id");

-- CreateIndex
CREATE INDEX "Employee_hire_date_idx" ON "Employee"("hire_date");

-- CreateIndex
CREATE INDEX "Employee_first_name_last_name_idx" ON "Employee"("first_name", "last_name");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employee_id_skill_id_key" ON "EmployeeSkill"("employee_id", "skill_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employee_id_idx" ON "EmployeeSkill"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skill_id_idx" ON "EmployeeSkill"("skill_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_level_idx" ON "EmployeeSkill"("level");

-- CreateIndex
CREATE INDEX "Compensation_employee_id_idx" ON "Compensation"("employee_id");

-- CreateIndex
CREATE INDEX "Compensation_effective_date_idx" ON "Compensation"("effective_date");

-- CreateIndex
CREATE INDEX "Compensation_is_current_idx" ON "Compensation"("is_current");

-- CreateIndex
CREATE INDEX "PerformanceReview_employee_id_idx" ON "PerformanceReview"("employee_id");

-- CreateIndex
CREATE INDEX "PerformanceReview_reviewer_id_idx" ON "PerformanceReview"("reviewer_id");

-- CreateIndex
CREATE INDEX "PerformanceReview_review_type_idx" ON "PerformanceReview"("review_type");

-- CreateIndex
CREATE INDEX "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- CreateIndex
CREATE INDEX "PerformanceReview_review_period_idx" ON "PerformanceReview"("review_period_start", "review_period_end");

-- CreateIndex
CREATE INDEX "Goal_employee_id_idx" ON "Goal"("employee_id");

-- CreateIndex
CREATE INDEX "Goal_performance_review_id_idx" ON "Goal"("performance_review_id");

-- CreateIndex
CREATE INDEX "Goal_category_idx" ON "Goal"("category");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");

-- CreateIndex
CREATE INDEX "Goal_due_date_idx" ON "Goal"("due_date");

-- CreateIndex
CREATE INDEX "Training_employee_id_idx" ON "Training"("employee_id");

-- CreateIndex
CREATE INDEX "Training_status_idx" ON "Training"("status");

-- CreateIndex
CREATE INDEX "Training_start_date_idx" ON "Training"("start_date");

-- CreateIndex
CREATE INDEX "Leave_employee_id_idx" ON "Leave"("employee_id");

-- CreateIndex
CREATE INDEX "Leave_type_idx" ON "Leave"("type");

-- CreateIndex
CREATE INDEX "Leave_status_idx" ON "Leave"("status");

-- CreateIndex
CREATE INDEX "Leave_start_date_idx" ON "Leave"("start_date");

-- CreateIndex
CREATE INDEX "Leave_end_date_idx" ON "Leave"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "TimeRecord_employee_id_date_key" ON "TimeRecord"("employee_id", "date");

-- CreateIndex
CREATE INDEX "TimeRecord_employee_id_idx" ON "TimeRecord"("employee_id");

-- CreateIndex
CREATE INDEX "TimeRecord_date_idx" ON "TimeRecord"("date");

-- CreateIndex
CREATE INDEX "Expense_employee_id_idx" ON "Expense"("employee_id");

-- CreateIndex
CREATE INDEX "Expense_category_idx" ON "Expense"("category");

-- CreateIndex
CREATE INDEX "Expense_status_idx" ON "Expense"("status");

-- CreateIndex
CREATE INDEX "Expense_expense_date_idx" ON "Expense"("expense_date");

-- CreateIndex
CREATE INDEX "Document_employee_id_idx" ON "Document"("employee_id");

-- CreateIndex
CREATE INDEX "Document_company_id_idx" ON "Document"("company_id");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "Document_is_confidential_idx" ON "Document"("is_confidential");

-- CreateIndex
CREATE INDEX "Policy_company_id_idx" ON "Policy"("company_id");

-- CreateIndex
CREATE INDEX "Policy_type_idx" ON "Policy"("type");

-- CreateIndex
CREATE INDEX "Policy_effective_date_idx" ON "Policy"("effective_date");

-- CreateIndex
CREATE INDEX "Policy_requires_acknowledgment_idx" ON "Policy"("requires_acknowledgment");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyAcknowledgment_employee_id_policy_id_key" ON "PolicyAcknowledgment"("employee_id", "policy_id");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgment_employee_id_idx" ON "PolicyAcknowledgment"("employee_id");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgment_policy_id_idx" ON "PolicyAcknowledgment"("policy_id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compensation" ADD CONSTRAINT "Compensation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_performance_review_id_fkey" FOREIGN KEY ("performance_review_id") REFERENCES "PerformanceReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training" ADD CONSTRAINT "Training_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeRecord" ADD CONSTRAINT "TimeRecord_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeRecord" ADD CONSTRAINT "TimeRecord_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgment" ADD CONSTRAINT "PolicyAcknowledgment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgment" ADD CONSTRAINT "PolicyAcknowledgment_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
