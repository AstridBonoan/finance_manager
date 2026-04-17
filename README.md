# 💼 Finance Manager - Personal Finance Application

A production-grade full-stack personal finance management system built with modern web technologies.

## 🎯 Features

- **Budget Management** - Intelligent budget allocation and tracking
- **Transaction Tracking** - Manual entry with categorization
- **Receipt Intelligence** - OCR-powered receipt processing
- **Financial Memory** - Spending baselines and anomaly detection
- **AI Financial Advisor** - OpenAI-powered financial insights
- **SaaS Ready** - Stripe subscription model with tiered access
- **Professional Grade** - Enterprise-level security and architecture

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **Auth:** Next-Auth.js

### Backend
- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **ORM:** Prisma
- **Validation:** class-validator, Zod

### Infrastructure
- **Database:** PostgreSQL
- **Storage:** S3-compatible (AWS S3 / MinIO)
- **AI:** OpenAI API
- **Payments:** Stripe API
- **Deployment:** Docker, Vercel (frontend), Cloud Run/ECS (backend)

## 📁 Project Structure

```
finance-manager/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   ├── components/    # React components
│   │   │   └── lib/           # Utilities & hooks
│   │   └── package.json
│   └── api/                    # NestJS backend
│       ├── src/
│       │   ├── modules/       # Feature modules
│       │   ├── common/        # Shared services
│       │   └── main.ts        # Entry point
│       └── package.json
├── packages/
│   ├── db/                    # Prisma & database
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── shared/                # Shared types & utilities
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── docs/
│   ├── architecture.md        # System architecture
│   └── roadmap.md            # Product roadmap
├── PROGRESS.md               # Agile progress tracker
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL 14+
- (Optional) Docker

### Installation

```bash
# Clone repository
git clone <repo-url>
cd finance-manager

# Install dependencies
pnpm install

# Setup database
cd packages/db
npx prisma migrate dev
cd ../..

# Create .env.local in apps/web and apps/api
# See .env.example files for required variables

# Development
pnpm dev          # Runs all apps in development mode
pnpm web          # Runs frontend only
pnpm api          # Runs backend only

# Build
pnpm build        # Builds all apps

# Testing
pnpm test         # Runs all tests
```

## 📊 Agile Methodology

This project follows strict Agile practices:
- **Epics:** Large business goals (7 total)
- **Sprints:** 1-week iterations
- **Tasks:** Atomic work items with clear acceptance criteria

**Current Status:** Sprint 1 (Foundation Setup)

See [PROGRESS.md](./PROGRESS.md) for detailed sprint tracking.
See [docs/roadmap.md](./docs/roadmap.md) for product roadmap.

## 📋 Development Workflow

### Sprint Execution
1. Start new sprint → All work tracked in PROGRESS.md
2. Complete tasks in order (no jumping ahead)
3. Update PROGRESS.md after each task
4. Sprint demo & review when sprint complete
5. Proceed to next sprint only after review

### Code Quality
- TypeScript strict mode enforced
- Prettier for formatting
- ESLint for code quality
- Husky pre-commit hooks
- 70%+ test coverage target

## 🔐 Security

- **Auth:** NextAuth.js with encrypted sessions
- **DB:** Row-level security via user_id
- **API:** Rate limiting, CORS, request validation
- **Payments:** PCI-compliant via Stripe
- **Storage:** Encrypted S3 with signed URLs
- **Secrets:** Environment variables, never committed

## 🤖 AI Integration

OpenAI-powered financial advisor:
- Analyzes spending patterns
- Provides budget recommendations
- Answers financial questions
- Generates insights from user data

## 💳 Payment Integration

Stripe subscriptions with three tiers:
- **Free:** Basic transaction tracking
- **Pro:** Premium analytics, AI advisor, receipt processing
- **Enterprise:** Dedicated support, advanced features

## 📚 Documentation

- [System Architecture](./docs/architecture.md) - Detailed system design
- [Product Roadmap](./docs/roadmap.md) - Feature timeline
- [PROGRESS.md](./PROGRESS.md) - Sprint-by-sprint tracking
- API Documentation (auto-generated from NestJS controllers)

## 🧪 Testing

```bash
# Unit tests
pnpm test:unit

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

## 🐛 Troubleshooting

### Database connection fails
```bash
# Verify PostgreSQL is running
# Check DATABASE_URL in .env.local
# Run migrations
npx prisma migrate dev
```

### Port conflicts
- Frontend: 3000
- Backend: 3001
- Change in .env.local if needed

### Dependencies issue
```bash
pnpm clean  # Remove node_modules
pnpm install
```

## 📞 Support

For issues or questions:
1. Check PROGRESS.md for current sprint goals
2. Review architecture.md for system design
3. Check API documentation
4. Create GitHub issue

## 📄 License

Proprietary - All rights reserved

## 🎯 Success Metrics

MVP is complete when:
- ✅ Users can authenticate
- ✅ Users can add/manage transactions
- ✅ Budget system calculates allocations
- ✅ Receipts can be uploaded and parsed
- ✅ AI advisor provides insights
- ✅ Stripe subscriptions functional
- ✅ System is production-ready

---

**Project Start:** April 17, 2026  
**Current Sprint:** 1 (Foundation Setup)  
**Last Updated:** 2026-04-17
