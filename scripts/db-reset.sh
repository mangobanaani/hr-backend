#!/bin/bash
# Database reset script for development

set -e

echo "⚠️  WARNING: This will reset your database!"
echo "This action will:"
echo "  1. Drop all tables"
echo "  2. Run all migrations"
echo "  3. Seed the database with sample data"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Database reset cancelled"
    exit 0
fi

echo ""
echo "Resetting database..."

# Reset Prisma
echo "→ Resetting Prisma database..."
npx prisma migrate reset --force

echo ""
echo "✅ Database reset complete!"
echo ""
echo "Your database has been reset with fresh data."
echo "You can now start the application with: npm run start:dev"
