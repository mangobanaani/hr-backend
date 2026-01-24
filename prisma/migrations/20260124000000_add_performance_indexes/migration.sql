-- Add performance indexes for common query patterns

-- Employee queries: often filter by status and department, sort by hireDate
CREATE INDEX IF NOT EXISTS "idx_employee_status_department" ON "employees"("status", "departmentId");
CREATE INDEX IF NOT EXISTS "idx_employee_status_hiredate" ON "employees"("status", "hireDate" DESC);

-- Time records: frequently queried by employee and date range
CREATE INDEX IF NOT EXISTS "idx_time_record_employee_date" ON "time_records"("employeeId", "date" DESC);
CREATE INDEX IF NOT EXISTS "idx_time_record_status_date" ON "time_records"("status", "date" DESC);
CREATE INDEX IF NOT EXISTS "idx_time_record_created" ON "time_records"("createdAt" DESC);

-- Expenses: queried by employee, status, and date
CREATE INDEX IF NOT EXISTS "idx_expense_employee_status" ON "expenses"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "idx_expense_date_status" ON "expenses"("submissionDate" DESC, "status");

-- Leave requests: queried by employee, status, and date range
CREATE INDEX IF NOT EXISTS "idx_leave_request_employee_status" ON "leave_requests"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "idx_leave_request_date_range" ON "leave_requests"("startDate", "endDate");

-- Performance reviews: queried by employee and cycle
CREATE INDEX IF NOT EXISTS "idx_performance_review_employee_cycle" ON "performance_reviews"("employeeId", "cycleId");
CREATE INDEX IF NOT EXISTS "idx_performance_review_status_date" ON "performance_reviews"("status", "reviewDate" DESC);

-- Goals: queried by employee and status
CREATE INDEX IF NOT EXISTS "idx_goal_employee_status" ON "goals"("employeeId", "status");
CREATE INDEX IF NOT EXISTS "idx_goal_due_date_status" ON "goals"("dueDate", "status");

-- User sessions: queried by user and token for authentication
CREATE INDEX IF NOT EXISTS "idx_user_session_user_token" ON "user_sessions"("userId", "refreshToken");
CREATE INDEX IF NOT EXISTS "idx_user_session_expires" ON "user_sessions"("expiresAt") WHERE "expiresAt" > NOW();

-- Departments: queried by company
CREATE INDEX IF NOT EXISTS "idx_department_company" ON "departments"("companyId");

-- Projects: queried by status and dates
CREATE INDEX IF NOT EXISTS "idx_project_status_dates" ON "projects"("status", "startDate", "endDate");
