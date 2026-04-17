# 🚀 Finance Manager - Sprint 1 Quick Start

**Status:** Sprint 1 Complete ✅  
**Date:** April 17, 2026

---

## 📦 What Has Been Built

### Foundation Infrastructure Complete
- **Monorepo:** pnpm workspaces configured
- **Frontend:** Next.js 14 with TypeScript, Tailwind CSS, React 18
- **Backend:** NestJS with modular architecture
- **Database:** Prisma ORM with comprehensive schema (25+ tables)
- **Shared:** Common types and utilities package
- **Auth:** Auth.js/NextAuth skeleton ready
- **Code Quality:** ESLint, Prettier, TypeScript strict mode

### Projects Structure
```
finance-manager/
├── apps/
│   ├── web/          # Next.js frontend (http://localhost:3000)
│   └── api/          # NestJS backend (http://localhost:3001)
├── packages/
│   ├── db/           # Prisma schema + client
│   └── shared/       # Shared types and utilities
├── docs/
│   ├── architecture.md
│   ├── roadmap.md
├── PROGRESS.md       # Agile progress tracker
└── README.md
```

---

## 🛠️ Getting Started (Development)

### 1. Setup Environment
```bash
# Navigate to project root
cd finance-manager

# Copy environment template to .env.local
copy .env.example .env.local
```

### 2. Configure Database
Edit `.env.local` and set:
```
DATABASE_URL="postgresql://user:password@localhost:5432/finance_db"
```

Ensure PostgreSQL is running locally on port 5432.

### 3. Setup Database
```bash
# Create migrations
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

### 4. Start Development Servers
```bash
# Both frontend and backend
pnpm dev

# Or run individually:
pnpm web   # Frontend only on port 3000
pnpm api   # Backend only on port 3001
```

### 5. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

---

## 📁 Key Files & Directories

### Frontend (`apps/web/`)
- `src/app/page.tsx` - Home page
- `src/app/layout.tsx` - Root layout
- `src/components/` - React components (to be expanded)
- `tailwind.config.js` - Styling configuration
- `next.config.js` - Next.js configuration

### Backend (`apps/api/`)
- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root module
- `src/modules/auth/` - Authentication module skeleton
- `src/modules/users/` - User management module skeleton

### Database (`packages/db/`)
- `prisma/schema.prisma` - Database schema (comprehensive)
- `prisma/migrations/` - Migration files (created on first migrate)
- `index.ts` - Exports Prisma client

### Shared (`packages/shared/`)
- `src/types.ts` - All TypeScript interfaces and types
- `src/utils.ts` - Utility functions
- Used by both frontend and backend

---

## 🗄️ Database Schema Overview

### Auth Models
- `User` - User accounts with subscription tier
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `VerificationToken` - Email verification

### Financial Models
- `Transaction` - Income/expense entries
- `Category` - Spending categories (income, groceries, utilities, etc.)
- `Budget` - Monthly budgets with allocation rules
- `BudgetAllocation` - Per-category budget tracking

### Intelligence Models
- `Receipt` - Uploaded receipts with OCR
- `SpendingBaseline` - Category spending averages
- `SpendingTrend` - Month-over-month trends
- `Anomaly` - Unusual spending detection

### AI Models
- `AdvisorConversation` - Chat history
- `AdvisorMessage` - Individual messages
- `Insight` - Generated insights and recommendations

### Payment Models
- `StripeCustomer` - Stripe integration
- `Invoice` - Billing records

---

## 📋 Available Commands

```bash
# Development
pnpm dev              # Start all (frontend + backend)
pnpm web              # Frontend only
pnpm api              # Backend only

# Building
pnpm build            # Build all apps
pnpm --filter=@finance-app/api run build    # Build backend only
pnpm --filter=@finance-app/web run build    # Build frontend only

# Database
pnpm db:migrate       # Run migrations
pnpm db:generate      # Generate Prisma client
pnpm db:studio        # Open Prisma Studio

# Code Quality
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking
pnpm format           # Format with Prettier

# Testing (scaffolding ready)
pnpm test             # Run all tests
```

---

## 🔐 Security Notes

### Current State (Sprint 1)
- ✅ TypeScript strict mode enabled
- ✅ Environment variables configured
- ✅ Prisma ORM (SQL injection prevention)
- ⏳ Auth.js authentication (to be connected in Sprint 2)
- ⏳ JWT guards on API routes (to be added in Sprint 2)
- ⏳ Database user permissions (to be configured)

### Before Production
- [ ] Enable HTTPS
- [ ] Setup real Stripe keys
- [ ] Configure S3 bucket with encryption
- [ ] Setup rate limiting on API
- [ ] Add CORS restrictions
- [ ] Enable database encryption
- [ ] Setup secrets management (not .env)
- [ ] Add request validation
- [ ] Implement audit logging

---

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean and reinstall
pnpm clean
pnpm install
pnpm build
```

### Database Connection Failed
```bash
# Verify PostgreSQL is running
# Windows: Check Services or run postgres.exe
# Mac: brew services list
# Linux: systemctl status postgresql

# Check connection string in .env.local
# Format: postgresql://user:password@host:port/database
```

### Port Already in Use
- Frontend (3000): Edit `next.config.js`
- Backend (3001): Edit `apps/api/.env.local`

### TypeScript Errors
```bash
pnpm type-check    # Run type checking
pnpm --filter=@finance-app/shared run build  # Check shared package
```

---

## 📚 Documentation

See the following files for more details:

1. **[PROGRESS.md](./PROGRESS.md)** - Agile sprint tracking
2. **[docs/roadmap.md](./docs/roadmap.md)** - Product roadmap and timeline
3. **[docs/architecture.md](./docs/architecture.md)** - System architecture and data flow
4. **[README.md](./README.md)** - Project overview

---

## 🎯 Next Steps (Sprint 2)

Sprint 2 will focus on:
- ✅ User dashboard layout
- ✅ Transaction CRUD operations
- ✅ Category management
- ✅ Basic analytics and summaries
- ✅ Manual transaction entry form
- ✅ Database migrations

**Estimated Duration:** 4-5 days

---

## 💡 Tips for Development

### Frontend Development
- Components use shadcn/ui patterns (add as needed via `npx shadcn-ui@latest add`)
- Use Tailwind CSS classes for styling
- Keep components in `src/components/`
- API calls will use `next/fetch` or similar

### Backend Development
- Use NestJS module pattern (one feature = one module)
- Services handle business logic
- Controllers handle HTTP routing
- Keep DTOs in each module for request/response
- Use Prisma for all database access

### Shared Types
- Update `packages/shared/src/types.ts` when adding new models
- Export all types from `src/index.ts`
- Use in both frontend and backend

---

## 📞 Questions?

Refer to:
1. `docs/architecture.md` for system design questions
2. `PROGRESS.md` for what's completed and what's next
3. Code comments in modules for implementation details

---

**Last Updated:** 2026-04-17  
**Sprint:** 1 (Foundation) - COMPLETE ✅  
**Next Sprint:** 2 (Core Financial System) - Awaiting approval
