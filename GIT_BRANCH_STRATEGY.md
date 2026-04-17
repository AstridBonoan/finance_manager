# Git Branch Strategy - Finance Manager

## Branch Structure

```
master (main branch)
├── feature/transactions      - Transaction CRUD operations
├── feature/categories        - Category management
├── feature/analytics         - Analytics & dashboard data
├── feature/frontend-dashboard - Dashboard UI components
└── feature/testing-ci        - GitHub Actions & testing setup
```

## Branch Naming Convention
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Production hotfixes
- `chore/*` - Configuration & tooling
- `docs/*` - Documentation updates

## Workflow

### Feature Development
1. Create feature branch from `master`
2. Develop feature with tests
3. Run local tests to verify
4. Commit to feature branch
5. Push to GitHub
6. Create Pull Request
7. GitHub Actions runs CI/CD checks
8. After approval, merge to `master`

### Branch Protections (Recommended for GitHub)
- Require pull request reviews before merge
- Require status checks to pass
- Require branches to be up to date before merge

---

## Feature Branches Details

### 1. feature/transactions
**Status:** ✅ Complete  
**Components:**
- `TransactionsModule` (NestJS)
- `TransactionsService` (6 methods)
- `TransactionsController` (6 endpoints)
- `transactions.service.spec.ts` (unit tests)

**Features:**
- Create, read, update, delete transactions
- Pagination & filtering
- Summary aggregation
- Ownership verification

**Tests:**
- Service unit tests with Jest
- Mock Prisma client
- Test cases for all CRUD operations

---

### 2. feature/categories
**Status:** ✅ Complete  
**Components:**
- `CategoriesModule` (NestJS)
- `CategoriesService` (7 methods)
- `CategoriesController` (7 endpoints)
- `categories.service.spec.ts` (unit tests)

**Features:**
- Create, read, update, delete categories
- 10 system categories with defaults
- System category protection
- Transaction orphaning on delete
- Spending statistics

**Tests:**
- Service unit tests with Jest
- Default category creation tests
- System category protection tests
- Delete operation tests

---

### 3. feature/analytics
**Status:** ✅ Complete  
**Components:**
- `AnalyticsModule` (NestJS)
- `AnalyticsService` (4 methods)
- `AnalyticsController` (4 endpoints)
- `analytics.service.spec.ts` (unit tests)

**Features:**
- Dashboard summary (monthly metrics)
- Spending trends (6-month analysis)
- Category analytics
- Income vs expense comparison
- Savings rate calculation

**Tests:**
- Service unit tests with Jest
- Dashboard summary tests
- Trend analysis tests
- Category analytics tests

---

### 4. feature/frontend-dashboard
**Status:** ✅ Complete  
**Components:**
- `DashboardSummary` component
- `TransactionForm` component
- `TransactionList` component
- `CategoryManagement` component
- `DashboardPage` (main page)
- NextAuth integration

**Tests:**
- `DashboardSummary.test.tsx` (React Testing Library)
- `TransactionForm.test.tsx` (React Testing Library)
- `CategoryManagement.test.tsx` (React Testing Library)

**Features:**
- Responsive dashboard with metric cards
- Pie chart visualization (Recharts)
- Transaction form with validation
- Transaction list with filtering
- Category management UI
- Tab-based navigation

---

### 5. feature/testing-ci
**Status:** ✅ Complete  
**Components:**
- `.github/workflows/ci.yml` (GitHub Actions)
- Jest configuration (API & Web)
- Test utilities & setup files
- Coverage reports

**Tests:**
- API type-checking
- API build validation
- API unit tests
- Frontend type-checking
- Frontend build validation
- Frontend component tests
- Linting checks

---

## GitHub Actions CI/CD Pipeline

### Workflow: `ci.yml`
**Triggers:**
- Push to: `main`, `develop`, `feature/**`
- Pull requests to: `main`, `develop`

### Jobs (run in parallel):
1. **setup** - Install dependencies (pnpm)
2. **backend-typecheck** - TypeScript validation for API
3. **backend-build** - Compile NestJS API
4. **backend-test** - Run API unit tests + coverage
5. **frontend-typecheck** - TypeScript validation for Web
6. **frontend-build** - Build Next.js app
7. **frontend-test** - Run component tests + coverage
8. **lint** - ESLint validation
9. **all-checks** - Summary status

### Status Checks
- ✅ Type checking (no implicit any)
- ✅ Build validation (compilable)
- ✅ Unit tests (coverage required)
- ✅ Linting (ESLint rules)

---

## Running Tests Locally

### Backend Tests
```bash
# Run all API tests
pnpm --filter=@finance-app/api run test

# Watch mode
pnpm --filter=@finance-app/api run test:watch

# Coverage report
pnpm --filter=@finance-app/api run test:cov
```

### Frontend Tests
```bash
# Run all web tests
pnpm --filter=@finance-app/web run test

# Watch mode
pnpm --filter=@finance-app/web run test:watch

# Coverage report
pnpm --filter=@finance-app/web run test:cov
```

### Type Checking
```bash
# API
pnpm --filter=@finance-app/api run type-check

# Web
pnpm --filter=@finance-app/web run type-check
```

### Linting
```bash
pnpm run lint
```

---

## Merging Strategy

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `test` - Test additions
- `chore` - Tooling/configuration
- `docs` - Documentation
- `refactor` - Code refactoring

**Example:**
```
feat(transactions): Add transaction filtering

- Add category filter
- Add date range filter
- Add transaction type filter

Closes #123
```

---

## Branch Merge Checklist

Before merging a feature branch:
- [ ] All tests passing locally
- [ ] GitHub Actions CI/CD passing
- [ ] No TypeScript errors
- [ ] ESLint validation passing
- [ ] Code review approved (if required)
- [ ] Commit messages follow convention
- [ ] Documentation updated

---

## Deploying to GitHub

### Initial Setup
```bash
git remote set-url origin https://github.com/AstridBonoan/finance_manager.git
```

### Push All Branches
```bash
git push -u origin master
git push -u origin feature/transactions
git push -u origin feature/categories
git push -u origin feature/analytics
git push -u origin feature/frontend-dashboard
git push -u origin feature/testing-ci
```

### Push Updates
```bash
git push origin <branch-name>
```

---

## GitHub Repository Configuration

### Recommended Settings
1. **Branch Protection Rules** (main branch)
   - Require pull request reviews before merge
   - Require status checks to pass
   - Require branches to be up to date

2. **Actions Settings**
   - Enable GitHub Actions
   - Allow all actions and reusable workflows

3. **Collaborator Settings**
   - Add team members with appropriate permissions
   - Set branch protection rules

---

## Progress Tracking

**Current Status:**
- Master branch: Initial setup ✅
- feature/transactions: Complete ✅
- feature/categories: Complete ✅
- feature/analytics: Complete ✅
- feature/frontend-dashboard: Complete ✅
- feature/testing-ci: Complete ✅

**Next Steps:**
1. Push all branches to GitHub
2. Configure branch protection rules
3. Create pull requests for code review
4. Merge approved features to master

---

**Created:** April 17, 2026  
**Last Updated:** April 17, 2026
