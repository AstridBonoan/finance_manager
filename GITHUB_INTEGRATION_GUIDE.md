# GitHub Integration & Testing Setup Guide

## 🎯 Overview

This document provides complete instructions for integrating with GitHub and managing the testing/CI-CD pipeline for the Finance Manager project.

---

## 📋 What's Been Set Up

### ✅ Git Repository Structure
```
Local Repository: c:\Users\astri\OneDrive\Desktop\finance_manager
Remote: https://github.com/AstridBonoan/finance_manager.git

Branches:
├── master              (main branch)
├── feature/transactions       (Transaction CRUD)
├── feature/categories         (Category Management)
├── feature/analytics          (Dashboard Analytics)
├── feature/frontend-dashboard (UI Components)
└── feature/testing-ci         (Testing & CI/CD Setup)
```

### ✅ GitHub Actions Workflow
```
File: .github/workflows/ci.yml

Triggers:
- Push to: main, develop, feature/**
- Pull requests to: main, develop

Jobs:
- setup (Install dependencies)
- backend-typecheck (TypeScript validation)
- backend-build (Compile NestJS)
- backend-test (Jest unit tests)
- frontend-typecheck (TypeScript validation)
- frontend-build (Next.js build)
- frontend-test (React Testing Library)
- lint (ESLint validation)
- all-checks (Summary status)
```

### ✅ Test Suites Implemented

**Backend (NestJS + Jest):**
- ✅ `transactions.service.spec.ts` (6 test cases)
- ✅ `categories.service.spec.ts` (6 test cases)
- ✅ `analytics.service.spec.ts` (4 test cases)

**Frontend (React + Jest + RTL):**
- ✅ `DashboardSummary.test.tsx` (4 test cases)
- ✅ `TransactionForm.test.tsx` (4 test cases)
- ✅ `CategoryManagement.test.tsx` (6 test cases)

### ✅ Documentation Created
- ✅ `GIT_BRANCH_STRATEGY.md` (Branch management guide)
- ✅ `TESTING_STRATEGY.md` (Comprehensive testing guide)
- ✅ `.github/workflows/ci.yml` (GitHub Actions workflow)
- ✅ `jest.config.js` (Backend Jest config)
- ✅ `jest.config.js` (Frontend Jest config)
- ✅ `jest.setup.js` (Frontend test setup)

---

## 🚀 Quick Start: Pushing to GitHub

### Step 1: Initial GitHub Setup

```bash
cd c:\Users\astri\OneDrive\Desktop\finance_manager

# Verify remote is set
git remote -v
# Output: origin  https://github.com/AstridBonoan/finance_manager.git (fetch/pull)

# If not set, add it:
git remote add origin https://github.com/AstridBonoan/finance_manager.git
```

### Step 2: Create/Configure Repository on GitHub

1. Go to https://github.com/AstridBonoan/finance_manager
2. If repo doesn't exist, create it (public or private)
3. Do NOT initialize with README/gitignore (we already have them)
4. Copy the HTTPS URL

### Step 3: Push All Branches to GitHub

```bash
# Push master branch (main)
git checkout master
git push -u origin master

# Push all feature branches
git push -u origin feature/transactions
git push -u origin feature/categories
git push -u origin feature/analytics
git push -u origin feature/frontend-dashboard
git push -u origin feature/testing-ci

# Or push all at once
git push -u origin --all
```

### Step 4: Verify on GitHub

Visit https://github.com/AstridBonoan/finance_manager and verify:
- ✅ All branches are visible
- ✅ Code is pushed
- ✅ GitHub Actions tab exists
- ✅ Workflows are available

---

## 🔧 GitHub Repository Configuration

### Enable GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Select: "Allow all actions and reusable workflows"
3. Save changes

### Configure Branch Protection (Recommended)

1. Go to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main` or `master`
4. Enable:
   - ✅ Require pull request reviews (at least 1)
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merge
   - ✅ Include administrators
5. Save

### Configure Status Checks

1. Go to **Settings** → **Branches**
2. Under "Require status checks to pass", select:
   - ✅ `backend-typecheck`
   - ✅ `backend-build`
   - ✅ `backend-test`
   - ✅ `frontend-typecheck`
   - ✅ `frontend-build`
   - ✅ `frontend-test`

---

## 🧪 Running Tests Locally

### Install Dependencies
```bash
cd c:\Users\astri\OneDrive\Desktop\finance_manager
pnpm install
```

### Backend Tests

```bash
# Run all backend tests
pnpm --filter=@finance-app/api run test

# Run with watch mode (re-runs on changes)
pnpm --filter=@finance-app/api run test:watch

# Generate coverage report
pnpm --filter=@finance-app/api run test:cov

# Run specific test file
pnpm --filter=@finance-app/api run test transactions.service.spec.ts
```

### Frontend Tests

```bash
# Run all frontend tests
pnpm --filter=@finance-app/web run test

# Run with watch mode
pnpm --filter=@finance-app/web run test:watch

# Generate coverage report
pnpm --filter=@finance-app/web run test:cov

# Run specific test file
pnpm --filter=@finance-app/web run test DashboardSummary.test.tsx
```

### Type Checking

```bash
# Check both
pnpm run type-check

# API only
pnpm --filter=@finance-app/api run type-check

# Web only
pnpm --filter=@finance-app/web run type-check
```

### Linting

```bash
# Check all files
pnpm run lint

# Fix issues automatically
pnpm run lint --fix
```

---

## 📊 GitHub Actions Status

### Check Workflow Status

1. Go to https://github.com/AstridBonoan/finance_manager/actions
2. Click on latest workflow run
3. View job results:
   - Green ✅ = Passed
   - Red ❌ = Failed
   - Yellow ⏳ = In progress

### View Logs

1. Click on failed job
2. Expand steps to see output
3. Look for error messages
4. Check "type-check" and "build" steps first

### Debug Failures

```bash
# Run locally to debug
pnpm --filter=@finance-app/api run type-check

# If type errors found, fix them
# If build errors found, run:
pnpm --filter=@finance-app/api run build

# Check specific error
npx tsc --noEmit --listFilesOnly
```

---

## 🌳 Branch Workflow

### Creating a New Feature Branch

```bash
# Start from master
git checkout master
git pull origin master

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Add tests
# Commit

git add .
git commit -m "feat: Your feature description

- Detail 1
- Detail 2

Closes #123"

# Push to GitHub
git push -u origin feature/your-feature-name
```

### Creating a Pull Request

1. Go to https://github.com/AstridBonoan/finance_manager
2. Click "Compare & pull request"
3. Select:
   - **Base:** `master`
   - **Compare:** `feature/your-feature-name`
4. Add description:
   ```
   ## Description
   Brief description of changes
   
   ## Changes
   - Change 1
   - Change 2
   
   ## Tests
   - Test case 1
   - Test case 2
   
   Closes #123
   ```
5. Click "Create pull request"
6. Wait for GitHub Actions to complete
7. Request review
8. Merge once approved and CI passes

### Merging to Master

Option 1: Via GitHub UI (Recommended)
1. Go to Pull Request
2. All checks must pass ✅
3. Click "Merge pull request"
4. Select "Squash and merge" (clean history)
5. Confirm merge

Option 2: Via Command Line
```bash
git checkout master
git pull origin master
git merge feature/your-feature-name
git push origin master
```

---

## 📈 Test Coverage Reports

### View Coverage Locally

```bash
# Backend coverage
pnpm --filter=@finance-app/api run test:cov

# Opens: apps/api/coverage/lcov-report/index.html

# Frontend coverage
pnpm --filter=@finance-app/web run test:cov

# Opens: apps/web/coverage/lcov-report/index.html
```

### GitHub Coverage Integration (Optional)

1. Add CodeCov or Coveralls action to CI
2. Generate coverage reports
3. View coverage badges on README

---

## 🔍 Common GitHub Actions Issues

### Issue: "Workflow file not found"
**Solution:** Ensure `.github/workflows/ci.yml` exists and is committed

### Issue: "pnpm not found"
**Solution:** Verify `pnpm/action-setup@v2` is in workflow

### Issue: "Dependencies not installed"
**Solution:** Check `cache: 'pnpm'` and `pnpm install` steps

### Issue: "TypeScript errors in CI"
**Solution:** Run `pnpm run type-check` locally and fix

### Issue: "Tests failing in CI but passing locally"
**Solution:** 
- Clear node_modules and reinstall
- Check Node.js version (should be 18+)
- Verify environment variables

---

## 📝 Commit Message Convention

Follow conventional commits for consistency:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `test` - Test additions/updates
- `chore` - Build/tooling/dependency updates
- `docs` - Documentation changes
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `ci` - CI/CD changes

### Scopes
- `api` - Backend API
- `web` - Frontend web app
- `db` - Database/Prisma
- `tests` - Testing infrastructure
- `ci` - CI/CD pipeline
- `docs` - Documentation

### Examples
```
feat(api): Add transaction pagination
test(web): Add DashboardSummary tests
chore(ci): Update Node.js to 18
docs: Add testing guide
```

---

## 🚀 Deployment Preparation

### Pre-Deployment Checklist

- [ ] All branches merged to master
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Coverage reports generated
- [ ] README updated
- [ ] Environment files documented
- [ ] Database migrations ready
- [ ] Version bumped (if applicable)

### Environment Variables

**Create `.env.local` files:**

Backend (`.env.local`):
```
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
DATABASE_URL=postgresql://...
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

---

## 📚 Additional Resources

### GitHub
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Issues](https://docs.github.com/en/issues)
- [GitHub Discussions](https://docs.github.com/en/discussions)
- [GitHub Security](https://docs.github.com/en/code-security)

### Testing
- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

### Git
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Verification Checklist

Before considering this complete:

- [ ] Git initialized locally
- [ ] Remote added to GitHub
- [ ] All branches pushed to GitHub
- [ ] GitHub Actions workflow is visible
- [ ] Tests can be run locally
- [ ] Branch protection rules configured
- [ ] README includes CI badge
- [ ] Contributors added (if applicable)
- [ ] Documentation files created
- [ ] Initial workflow run successful

---

## 🎓 Next Steps

1. **Push to GitHub**
   ```bash
   git push -u origin --all
   ```

2. **Configure Repository**
   - Enable Actions
   - Setup branch protection
   - Add collaborators

3. **Run CI/CD**
   - Make a test commit
   - Watch workflow execute
   - Verify all checks pass

4. **Create First PR**
   - Create a feature branch
   - Make small change
   - Create pull request
   - Merge after approval

5. **Monitor & Improve**
   - Monitor test coverage
   - Review action logs
   - Update as needed
   - Scale as project grows

---

**Created:** April 17, 2026  
**Last Updated:** April 17, 2026  
**Status:** ✅ Ready for GitHub Integration
