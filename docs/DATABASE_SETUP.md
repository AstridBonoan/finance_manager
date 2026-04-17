# Finance Manager - Database Setup Guide

## Overview

Finance Manager uses **PostgreSQL** with **Prisma ORM** for database management. This guide covers local development setup and production deployment.

## Prerequisites

- PostgreSQL 13+ installed
- Node.js 18+
- pnpm 8+

## Local Development Setup

### Step 1: Install PostgreSQL

#### Windows
```bash
# Using Chocolatey
choco install postgresql

# Or download from https://www.postgresql.org/download/windows/
```

#### macOS
```bash
# Using Homebrew
brew install postgresql

# Start service
brew services start postgresql
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
```

### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE finance_manager_dev;
CREATE DATABASE finance_manager_test;

# Create user
CREATE USER finance_app WITH PASSWORD 'secure-password-here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE finance_manager_dev TO finance_app;
GRANT ALL PRIVILEGES ON DATABASE finance_manager_test TO finance_app;

# Verify
\l  # List databases
\du # List users

# Exit
\q
```

### Step 3: Configure Environment Variables

Create `.env.local` in the root directory:

```bash
DATABASE_URL="postgresql://finance_app:secure-password-here@localhost:5432/finance_manager_dev"
```

### Step 4: Generate Prisma Client

```bash
cd c:\Users\astri\OneDrive\Desktop\finance_manager
pnpm db:generate
```

### Step 5: Run Migrations

```bash
# Run all pending migrations
pnpm db:migrate

# Apply migrations in production
pnpm db:migrate:prod
```

### Step 6: Seed Initial Data (Optional)

```bash
pnpm --filter=@finance-app/db run seed
```

## Prisma Schema Reference

### Database Schema Location
```
packages/db/prisma/schema.prisma
```

### Main Tables

- **User** - User accounts
- **Category** - Transaction categories
- **Transaction** - Individual transactions
- **Budget** - Budget configurations
- **Receipt** - Receipt documents and data

## Common Prisma Commands

```bash
# Generate Prisma Client
pnpm db:generate

# Open Prisma Studio (GUI)
pnpm db:studio

# View migration status
pnpm db:migrate status

# Reset database (development only!)
pnpm db:migrate reset

# Create new migration
pnpm db:migrate dev --name migration_name

# Format schema
pnpm --filter=@finance-app/db run format
```

## Troubleshooting

### "Connection refused" Error
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running, start it:
# Windows: Open Services and start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

### "Database already exists" Error
```bash
# Drop and recreate (development only!)
psql -U postgres -c "DROP DATABASE finance_manager_dev;"
psql -U postgres -c "CREATE DATABASE finance_manager_dev;"
```

### "No such file or directory" - prisma/schema.prisma
```bash
# Regenerate Prisma
pnpm db:generate
```

## Production Database Setup

### AWS RDS Setup

1. Create RDS PostgreSQL instance
2. Configure security groups (allow port 5432)
3. Set admin password
4. Create application user and database

### Environment Variables (Production)

```bash
DATABASE_URL="postgresql://user:password@your-rds-endpoint:5432/finance_manager"
NODE_ENV=production
```

### Production Migrations

```bash
# Apply migrations
pnpm db:migrate:prod

# Verify schema
psql -U user -h your-rds-endpoint -d finance_manager -c "\dt"
```

## Backup & Restore

### Backup Database

```bash
# Full backup
pg_dump -U finance_app finance_manager_dev > backup.sql

# With compression
pg_dump -U finance_app finance_manager_dev | gzip > backup.sql.gz
```

### Restore Database

```bash
# From backup
psql -U finance_app finance_manager_dev < backup.sql

# From compressed backup
gunzip -c backup.sql.gz | psql -U finance_app finance_manager_dev
```

## Performance Tips

1. **Index frequently queried columns** - Already configured in schema
2. **Regular backups** - Set up automated daily backups
3. **Monitor connections** - Check for connection leaks
4. **Archive old data** - Archive transactions older than 2 years
5. **Use connection pooling** - Prisma uses built-in pooling

## Security Best Practices

- ✅ Use strong passwords (16+ characters)
- ✅ Never commit `.env.local` to git
- ✅ Rotate credentials regularly
- ✅ Use TLS for remote connections
- ✅ Enable SSL in production
- ✅ Regular security audits
- ✅ Monitor for suspicious activity

## Connection String Format

```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]

Examples:
postgresql://localhost/mydb                    # Local, default port
postgresql://user:password@localhost:5432/mydb # Full specification
postgresql://user@server.com/mydb              # Remote server
postgresql://user:pass@server.com:5432/mydb?sslmode=require  # With SSL
```

## Monitoring & Logs

```bash
# View PostgreSQL logs
tail -f /var/log/postgresql/postgresql.log  # Linux
# macOS: /usr/local/var/log/postgres.log
# Windows: Check Event Viewer

# Check active connections
psql -U postgres -c "SELECT pid, usename, application_name, state FROM pg_stat_activity;"

# Check database size
psql -U postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) FROM pg_database;"
```

## Next Steps

1. Configure GitHub Secrets with DATABASE_URL
2. Set up automated backups
3. Configure monitoring alerts
4. Create runbooks for common operations
5. Document disaster recovery procedures

---

**Questions?** Check the [main README](../README.md) or GitHub Issues.
