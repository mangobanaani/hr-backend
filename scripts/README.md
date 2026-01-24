# Development Scripts

Utility scripts for development and operations.

## Available Scripts

### Health Check
```bash
npm run health
# or
./scripts/check-health.sh
```
Checks the health of the API including:
- Overall health status
- Database connectivity and response time
- System resources (memory, uptime)

Set custom API URL:
```bash
API_URL=http://production-server.com npm run health
```

### Database Operations

#### Reset Database
```bash
npm run db:reset
# or
./scripts/db-reset.sh
```
**WARNING**: This will drop all data and reset the database with fresh migrations and seeds.

#### Run Migrations
```bash
npm run db:migrate
```
Runs Prisma migrations in development mode.

#### Generate Prisma Client
```bash
npm run db:generate
```
Regenerates the Prisma client after schema changes.

#### Open Prisma Studio
```bash
npm run db:studio
```
Opens Prisma Studio for visual database management.

## Requirements

- `jq` for health check script (install: `brew install jq` on macOS)
- `curl` for API requests
- Active database connection for database scripts
