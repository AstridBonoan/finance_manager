# Finance Manager - Deep Dive, Security Review, and Execution Log

## Purpose of This Document

This is the single living document for:

- Full system understanding (architecture, features, data flow).
- Security review findings and risk analysis.
- Execution history of what was changed and why.
- Roadmap continuation status.

Going forward, this document should be updated after every meaningful implementation step.

---

## 1) Current Project Snapshot

Finance Manager is a monorepo personal finance platform with a Next.js frontend and a NestJS backend, backed by PostgreSQL via Prisma.

Core implemented feature areas:

- Transactions (CRUD + summaries)
- Categories (defaults + CRUD + stats)
- Analytics (dashboard, trend, category, income vs expense)
- Budgets/Allocations (backend APIs + frontend component set)
- Receipts (upload/parse/status APIs and frontend components, partially stubbed)

Partially implemented / placeholder feature areas:

- Authentication integration consistency (frontend/backend contract mismatch)
- Users module persistence logic
- Financial Memory (Sprint 5 planned, not started)
- AI advisor and billing runtime paths (schema/plan present, feature runtime pending)

---

## 2) Monorepo Architecture

### Apps and Packages

- `apps/web`
  - Next.js 14 App Router client app
  - NextAuth session provider
  - Dashboard and finance UI components
- `apps/api`
  - NestJS REST API
  - Feature modules per domain
- `packages/db`
  - Prisma schema and generated client
- `packages/shared`
  - Shared TypeScript types and Zod schemas

### Primary Runtime Stack

- Frontend: Next.js, React, TypeScript, Tailwind, Radix/shadcn, Recharts, NextAuth
- Backend: NestJS, Passport JWT, Prisma
- Database: PostgreSQL
- Validation: Zod (shared schemas), Nest global `ValidationPipe`

---

## 3) High-Level Data Flow

1. User interacts with UI in `apps/web`.
2. Frontend requests backend REST endpoints in `apps/api`.
3. Backend controllers validate and route to services.
4. Services query/update PostgreSQL through Prisma.
5. Backend returns JSON to frontend for rendering and interaction updates.

---

## 4) Feature Breakdown

### Transactions

- Create, list (pagination/filtering), fetch one, update, delete, summary by date range.
- Frontend components:
  - `TransactionForm`
  - `TransactionList`
- Backend:
  - `transactions.controller.ts`
  - `transactions.service.ts`
- Validation:
  - `CreateTransactionSchema` from `packages/shared`.

### Categories

- Seed defaults per user, create custom category, list, retrieve, update, delete, stats.
- Frontend:
  - `CategoryManagement`
- Backend:
  - `categories.controller.ts`
  - `categories.service.ts`
- Validation:
  - `CreateCategorySchema` from shared package.

### Analytics

- Dashboard summary, monthly trend, category analytics, income-vs-expense report.
- Frontend:
  - `DashboardSummary`
- Backend:
  - `analytics.controller.ts`
  - `analytics.service.ts`

### Budgets and Allocations

- Budget allocation CRUD, rules, recommendation, usage endpoints.
- Frontend:
  - `BudgetPage`, `BudgetWidget`, `BudgetForm`, `AllocationDashboard`, `BudgetAlerts`
- Backend:
  - `budgets.controller.ts` / `budgets.service.ts`
  - `allocations.controller.ts` / `allocations.service.ts`

### Receipts

- Upload metadata validation, extraction trigger, list/detail/status/delete/stats.
- Frontend:
  - `ReceiptUploadForm`, `ReceiptList`, `ReceiptDetail`
- Backend:
  - `receipts.controller.ts` / `receipts.service.ts`

---

## 5) Authentication and Trust Model (Before Hardening)

Observed pre-hardening risks:

- Most data routes accepted `userId` from query params.
- Identity was effectively client-asserted, not server-derived.
- Receipts controller used hardcoded `"user-id"` instead of authenticated user context.
- Users/auth modules had placeholder behavior.
- JWT secret had weak fallback default.

This created high risk of broken access control and IDOR-style cross-user access.

---

## 6) API Surface (Implemented Endpoints)

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile`

Users:

- `GET /users/:id`
- `PUT /users/:id`
- `GET /users/:id/settings`

Transactions:

- `POST /transactions`
- `GET /transactions`
- `GET /transactions/:id`
- `PUT /transactions/:id`
- `DELETE /transactions/:id`
- `GET /transactions/summary/byDateRange`

Categories:

- `POST /categories/defaults`
- `POST /categories`
- `GET /categories`
- `GET /categories/:id`
- `PUT /categories/:id`
- `DELETE /categories/:id`
- `GET /categories/stats/byDateRange`

Analytics:

- `GET /analytics/dashboard`
- `GET /analytics/trend`
- `GET /analytics/categories`
- `GET /analytics/income-vs-expense`

Budgets:

- `POST /budgets`
- `GET /budgets`
- `GET /budgets/summary`
- `GET /budgets/:id`
- `PATCH /budgets/:id`
- `DELETE /budgets/:id`

Allocations:

- `POST /allocations/rules`
- `GET /allocations/calculate`
- `GET /allocations/recommendations`
- `GET /allocations/usage`

Receipts:

- `POST /receipts/:id/extract`
- `GET /receipts`
- `GET /receipts/:id`
- `PATCH /receipts/:id/status`
- `DELETE /receipts/:id`
- `GET /receipts/stats/summary`

---

## 7) Security Review Findings (Pre-Hardening)

### Critical

1. Broken access control risk due to client-supplied `userId`.
2. Receipt routes using hardcoded user context.
3. Users endpoints lacking robust ownership checks and auth enforcement.

### Medium

1. Auth flow mismatch between NextAuth expectation and backend login response.
2. Weak JWT secret fallback pattern.
3. Broad query/body input acceptance in some endpoints without strict DTO constraints.

### Lower-Risk Notes

1. No direct raw SQL use observed; Prisma reduces SQL injection risk.
2. No obvious dangerous HTML injection APIs in frontend observed.
3. Missing centralized rate limiting and audit enforcement in runtime flow.

---

## 8) Roadmap Position and Next Steps

### Confirmed Position

- `PROGRESS.md` indicates Sprint 4 complete and Sprint 5 not started.

### Recommended Order

1. Security hardening and trust-boundary correction.
2. Begin Sprint 5 (Financial Memory) with baseline/trend foundation.
3. Expand testing around authz and data ownership.
4. Continue EPIC 6 and EPIC 7 only after access control baseline is stable.

---

## 9) Change Log (Living Section)

Use this section for ongoing updates.

### 2026-04-24

- Created this comprehensive deep-dive and security review document.
- Captured architecture, feature map, API map, trust analysis, and roadmap continuation point.
- Completed security hardening phase (backend + frontend integration):
  - Implemented real backend auth login/register with password hashing (scrypt + salt).
  - Backend now issues JWT access tokens and profile route uses JWT guard.
  - Added `JwtAuthGuard` and `CurrentUser` decorator for server-derived user identity.
  - Removed client-trusted `userId` query dependency in primary protected controllers.
  - Protected transactions, categories, analytics, budgets, allocations, receipts, and users routes with JWT guards.
  - Replaced hardcoded receipt user context with authenticated user context.
  - Enforced users endpoint ownership checks (`/users/:id` routes).
  - Added frontend authenticated API helper and updated key dashboard/transaction/category fetches to send bearer token.
- Completed Sprint 5 foundation kickoff:
  - Added new `financial-memory` module.
  - Added baseline recalculation endpoint.
  - Added baseline, trend, and anomaly read endpoints.
  - Registered module in API `AppModule`.
- Continued Sprint 5 implementation:
  - Added trend generation endpoint (`POST /financial-memory/trends/generate`)
  - Added anomaly detection endpoint (`POST /financial-memory/anomalies/detect`)
  - Added spending habit detection endpoint (`GET /financial-memory/habits`)
  - Implemented baseline-driven `unusual_amount` anomaly creation
  - Implemented month-over-month trend persistence logic
  - Implemented recurring spend cadence classification (weekly/biweekly/monthly/irregular)
- CI/GitHub Actions alignment:
  - Added missing API script used by workflow: `type-check`
  - Added API tsconfig path mappings so CI type-check resolves `@finance-app/shared` without requiring prebuilt shared dist

