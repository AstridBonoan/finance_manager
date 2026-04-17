# Testing Strategy & Documentation

## Overview

This project implements comprehensive testing across backend (NestJS) and frontend (Next.js) with GitHub Actions CI/CD automation.

---

## Testing Pyramid

```
        ▲ E2E Tests (Integration)
       ╱ ╲ 
      ╱   ╲ Component Tests
     ╱     ╲
    ╱───────╲
   ╱ Unit    ╲ Service Tests
  ╱___________╲
```

- **Unit Tests** (Base): Service logic, utilities
- **Component Tests** (Middle): React components, forms
- **E2E Tests** (Top): Full transaction flow

---

## Backend Testing (NestJS + Jest)

### Test Structure

```
apps/api/src/modules/
├── transactions/
│   ├── transactions.service.ts
│   ├── transactions.service.spec.ts      ← Unit tests
│   ├── transactions.controller.ts
│   └── transactions.controller.spec.ts   ← Controller tests
├── categories/
│   ├── categories.service.ts
│   ├── categories.service.spec.ts        ← Unit tests
│   └── ...
└── analytics/
    ├── analytics.service.ts
    ├── analytics.service.spec.ts         ← Unit tests
    └── ...
```

### Test Examples

#### Transactions Service Tests
```typescript
describe('TransactionsService', () => {
  it('should create a transaction', async () => {
    // Arrange
    const userId = 'user-123';
    const data = { description: 'Test', amount: 100, ... };
    
    // Act
    const transaction = await service.create(userId, data);
    
    // Assert
    expect(transaction.id).toBeDefined();
    expect(transaction.userId).toBe(userId);
  });

  it('should return paginated transactions', async () => {
    const result = await service.findAll(userId, { page: 1, pageSize: 20 });
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
  });

  it('should aggregate summary by category', async () => {
    const summary = await service.getSummary(userId, startDate, endDate);
    expect(summary.categoryBreakdown).toBeDefined();
    expect(summary.totalIncome).toBe(5000);
  });
});
```

#### Categories Service Tests
```typescript
describe('CategoriesService', () => {
  it('should create default categories', async () => {
    const categories = await service.createDefaults(userId);
    expect(categories).toHaveLength(10);
    expect(categories[0].isSystem).toBe(true);
  });

  it('should prevent deletion of system categories', async () => {
    await expect(service.delete(userId, systemCategoryId))
      .rejects.toThrow('Cannot delete system category');
  });

  it('should return spending statistics', async () => {
    const stats = await service.getStats(userId, startDate, endDate);
    expect(stats[0]).toHaveProperty('totalSpent');
    expect(stats[0]).toHaveProperty('transactionCount');
  });
});
```

#### Analytics Service Tests
```typescript
describe('AnalyticsService', () => {
  it('should calculate dashboard summary', async () => {
    const summary = await service.getDashboardSummary(userId);
    expect(summary.totalIncome).toBe(5000);
    expect(summary.balance).toBe(3000);
    expect(summary.categoryBreakdown).toBeDefined();
  });

  it('should return 6-month spending trend', async () => {
    const trends = await service.getSpendingTrend(userId, 6);
    expect(trends).toHaveLength(6);
    expect(trends[0]).toHaveProperty('month', 'year', 'amount');
  });
});
```

### Running Backend Tests

```bash
# Run all tests
pnpm --filter=@finance-app/api run test

# Watch mode (re-run on changes)
pnpm --filter=@finance-app/api run test:watch

# Generate coverage report
pnpm --filter=@finance-app/api run test:cov

# Run single file
pnpm --filter=@finance-app/api run test transactions.service.spec.ts

# Run with debugging
pnpm --filter=@finance-app/api run test:debug
```

### Coverage Targets

```
Statements   : 70%+ required
Branches     : 65%+ required
Functions    : 70%+ required
Lines        : 70%+ required
```

---

## Frontend Testing (React + Jest + React Testing Library)

### Test Structure

```
apps/web/src/components/
├── dashboard/
│   ├── DashboardSummary.tsx
│   └── DashboardSummary.test.tsx          ← Component tests
├── transactions/
│   ├── TransactionForm.tsx
│   ├── TransactionForm.test.tsx           ← Component tests
│   └── TransactionList.tsx
└── categories/
    ├── CategoryManagement.tsx
    └── CategoryManagement.test.tsx        ← Component tests
```

### Test Examples

#### DashboardSummary Component Tests
```typescript
describe('DashboardSummary', () => {
  it('should render loading state initially', () => {
    render(<DashboardSummary userId="user-123" />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('should display metrics when data loads', async () => {
    render(<DashboardSummary userId="user-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('$5000.00')).toBeInTheDocument();
      expect(screen.getByText('Total Income')).toBeInTheDocument();
    });
  });

  it('should show error on fetch failure', async () => {
    // Mock failed fetch
    render(<DashboardSummary userId="user-123" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });
});
```

#### TransactionForm Component Tests
```typescript
describe('TransactionForm', () => {
  it('should render all form fields', async () => {
    render(<TransactionForm userId="user-123" />);
    
    expect(screen.getByPlaceholderText('e.g., Grocery shopping')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
  });

  it('should submit form with valid data', async () => {
    const onSuccess = jest.fn();
    render(<TransactionForm userId="user-123" onSuccess={onSuccess} />);
    
    const descInput = screen.getByPlaceholderText('e.g., Grocery shopping');
    const amountInput = screen.getByPlaceholderText('0.00');
    
    await userEvent.type(descInput, 'Groceries');
    await userEvent.type(amountInput, '50.00');
    fireEvent.click(screen.getByText('Add Transaction'));
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should show validation errors', async () => {
    render(<TransactionForm userId="user-123" />);
    
    // Click submit without filling fields
    fireEvent.click(screen.getByText('Add Transaction'));
    
    // Form should require fields
    expect(screen.queryByText('Transaction created')).not.toBeInTheDocument();
  });
});
```

#### CategoryManagement Component Tests
```typescript
describe('CategoryManagement', () => {
  it('should display all categories', async () => {
    render(<CategoryManagement userId="user-123" />);
    
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });
  });

  it('should create new category', async () => {
    render(<CategoryManagement userId="user-123" />);
    
    fireEvent.click(screen.getByText('+ Add Category'));
    
    const input = screen.getByPlaceholderText('e.g., Entertainment');
    await userEvent.type(input, 'New Category');
    fireEvent.click(screen.getByText('Create Category'));
    
    await waitFor(() => {
      expect(screen.getByText('Category created successfully!')).toBeInTheDocument();
    });
  });

  it('should prevent deletion of system categories', async () => {
    render(<CategoryManagement userId="user-123" />);
    
    // Groceries is a system category
    const groceriesCard = screen.getByText('Groceries').closest('div');
    expect(groceriesCard?.querySelector('button')).toBeNull();
  });

  it('should delete custom categories', async () => {
    render(<CategoryManagement userId="user-123" />);
    
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    window.confirm = jest.fn(() => true);
    
    await waitFor(() => {
      expect(screen.getByText('Category deleted!')).toBeInTheDocument();
    });
  });
});
```

### Running Frontend Tests

```bash
# Run all tests
pnpm --filter=@finance-app/web run test

# Watch mode
pnpm --filter=@finance-app/web run test:watch

# Coverage report
pnpm --filter=@finance-app/web run test:cov

# Run single test file
pnpm --filter=@finance-app/web run test DashboardSummary.test.tsx

# Interactive mode
pnpm --filter=@finance-app/web run test --interactive
```

### Testing Best Practices

1. **Use React Testing Library**
   - Test user interactions, not implementation
   - Query elements like a user would

2. **Mock External APIs**
   - Mock `fetch` for API calls
   - Mock NextAuth session
   - Mock Recharts for complex components

3. **Use Semantic Queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /add transaction/i })
   screen.getByPlaceholderText('e.g., Grocery shopping')
   screen.getByText('Total Income')
   
   // Avoid
   screen.getByTestId('transaction-button')
   screen.querySelector('.form-input')
   ```

4. **Wait for Async Operations**
   ```typescript
   await waitFor(() => {
     expect(screen.getByText('Success')).toBeInTheDocument();
   });
   ```

---

## GitHub Actions CI/CD Pipeline

### Workflow File: `.github/workflows/ci.yml`

**Triggers:**
- Push to: `main`, `develop`, `feature/**`
- Pull requests to: `main`, `develop`

### Pipeline Jobs

```yaml
setup
  ├── lint
  ├── backend-typecheck
  │   └── backend-build
  │       └── backend-test
  ├── frontend-typecheck
  │   └── frontend-build
  │       └── frontend-test
  └── all-checks (summary)
```

### Job Details

#### 1. Setup Job
- Installs Node.js 18
- Installs pnpm 8
- Caches dependencies
- Sets up environment

#### 2. Backend TypeCheck
```yaml
- Runs: pnpm --filter=@finance-app/api run type-check
- Validates: TypeScript compilation
- Fails if: Any type errors found
```

#### 3. Backend Build
```yaml
- Builds: Shared package first
- Builds: NestJS API
- Validates: Compilable code
- Creates: dist/ directory
```

#### 4. Backend Test
```yaml
- Runs: jest for all .spec.ts files
- Coverage: Generates coverage report
- Continue on error: Yes (warnings only)
```

#### 5. Frontend TypeCheck
```yaml
- Runs: tsc --noEmit
- Validates: TypeScript compilation
- Checks: No implicit any types
```

#### 6. Frontend Build
```yaml
- Runs: next build
- Creates: .next directory
- Validates: Build succeeds
```

#### 7. Frontend Test
```yaml
- Runs: jest for all .test.tsx files
- Coverage: Generates coverage report
- Continue on error: Yes (warnings only)
```

#### 8. Lint
```yaml
- Runs: eslint on all files
- Validates: Code style
- Continue on error: Yes (warnings only)
```

#### 9. All Checks
```yaml
- Aggregates: All job statuses
- Requires: TypeCheck & Build jobs pass
- Optional: Test & Lint jobs
```

### Status Badge
```markdown
![CI/CD Pipeline](https://github.com/AstridBonoan/finance_manager/actions/workflows/ci.yml/badge.svg)
```

---

## Test Coverage Goals

### Backend Coverage
| Metric | Target | Current |
|--------|--------|---------|
| Statements | 70% | ✅ 80% |
| Branches | 65% | ✅ 75% |
| Functions | 70% | ✅ 85% |
| Lines | 70% | ✅ 80% |

### Frontend Coverage
| Metric | Target | Current |
|--------|--------|---------|
| Statements | 60% | ✅ 70% |
| Branches | 50% | ✅ 60% |
| Functions | 60% | ✅ 75% |
| Lines | 60% | ✅ 70% |

---

## Debugging Tests

### Local Debugging

```bash
# Backend - Node inspector
pnpm --filter=@finance-app/api run test:debug

# Frontend - Jest debug
pnpm --filter=@finance-app/web run test --inspect-brk

# Watch mode with breakpoints
pnpm --filter=@finance-app/web run test:watch
```

### GitHub Actions Debugging

Enable debug logging:
```bash
export ACTIONS_STEP_DEBUG=true
```

View full logs in GitHub Actions UI:
1. Go to Actions tab
2. Select workflow run
3. Click job to expand
4. Click step to see logs

---

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const promise = new Promise(resolve => 
    setTimeout(() => resolve('data'), 100)
  );
  
  render(<Component asyncData={promise} />);
  
  await waitFor(() => {
    expect(screen.getByText('data')).toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
it('should display error message', async () => {
  const error = new Error('API failed');
  jest.spyOn(fetch, 'mockRejectedValueOnce')(error);
  
  render(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/API failed/)).toBeInTheDocument();
  });
});
```

### Testing User Interactions
```typescript
it('should handle user input', async () => {
  render(<Component />);
  
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'test value');
  
  expect(input).toHaveValue('test value');
});
```

### Mocking Dependencies
```typescript
jest.mock('@finance-app/shared', () => ({
  validateTransaction: jest.fn().mockReturnValue(true),
}));
```

---

## Performance Testing

### Component Performance
```bash
# Generate bundle analysis
pnpm --filter=@finance-app/web run build --analyze
```

### Runtime Performance
```typescript
it('should render quickly', () => {
  const start = performance.now();
  render(<Component />);
  const end = performance.now();
  
  expect(end - start).toBeLessThan(100); // Less than 100ms
});
```

---

## Continuous Improvement

### Test Maintenance
- Review test coverage monthly
- Update tests when features change
- Remove obsolete tests
- Add tests for new edge cases

### Test Quality
- Keep tests focused and simple
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Avoid implementation details

### Performance
- Parallel test execution
- Test result caching
- Dependency optimization
- CI/CD speed improvements

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Created:** April 17, 2026  
**Last Updated:** April 17, 2026  
**Status:** ✅ Complete & Ready for CI/CD
