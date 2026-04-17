# 🏛️ Finance Manager - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                              │
│                   Next.js (App Router) + TypeScript                │
│           ┌────────────────────────────────────────┐               │
│           │  Dashboard │ Transactions │ Budgets    │               │
│           │  Receipts  │  Analytics   │ Advisor    │               │
│           └────────────────────────────────────────┘               │
│                         (Tailwind + shadcn/ui)                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                    HTTP/REST API
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      API Layer (Backend)                            │
│                   NestJS + Node.js + TypeScript                     │
│     ┌─────────────────────────────────────────────────────┐        │
│     │ Auth Service │ Transaction Service │ Budget Service │        │
│     │ Receipt Service │ Analytics Service │ AI Service    │        │
│     │ Stripe Service  │ User Service                      │        │
│     └─────────────────────────────────────────────────────┘        │
│                    (Express/REST Endpoints)                        │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        │                  │                  │
┌───────▼──────┐ ┌──────────▼──────┐ ┌───────▼─────────┐
│  PostgreSQL  │ │  S3 Storage    │ │  OpenAI API     │
│  Database    │ │  (Receipts)    │ │  (Advisor)      │
│              │ │                │ │                 │
│ • Users      │ │ • Receipt      │ │ • Prompts       │
│ • Accounts   │ │   images       │ │ • Context       │
│ • Txns       │ │ • Parsed data  │ │ • Responses     │
│ • Categories │ │                │ │                 │
│ • Budgets    │ └────────────────┘ └─────────────────┘
│ • etc.       │
└──────────────┘
        │
┌───────▼──────────────────┐
│  Prisma ORM & Client     │
│  (@finance-app/db pkg)   │
└──────────────────────────┘
```

---

## Service Architecture

### 1. **Auth Service** 🔐
- **Responsibility:** User authentication and session management
- **Technology:** NextAuth.js + Auth.js
- **Features:**
  - OAuth provider integration
  - JWT token management
  - Session persistence
  - RBAC (Role-Based Access Control)

### 2. **User Service** 👤
- **Responsibility:** User account management
- **Endpoints:**
  - `GET /users/profile` - User profile
  - `PUT /users/profile` - Update profile
  - `GET /users/settings` - User preferences
  - `PUT /users/settings` - Update settings

### 3. **Transaction Service** 📝
- **Responsibility:** Transaction CRUD operations and querying
- **Endpoints:**
  - `POST /transactions` - Create transaction
  - `GET /transactions` - List transactions (with filters)
  - `GET /transactions/:id` - Get single transaction
  - `PUT /transactions/:id` - Update transaction
  - `DELETE /transactions/:id` - Delete transaction

### 4. **Category Service** 🏷️
- **Responsibility:** Category management and hierarchy
- **Endpoints:**
  - `GET /categories` - List all categories
  - `POST /categories` - Create category
  - `PUT /categories/:id` - Update category
  - `DELETE /categories/:id` - Delete category

### 5. **Budget Service** 💰
- **Responsibility:** Budget rules, allocation logic, and comparisons
- **Key Logic:**
  - Allocation formula engine
  - Monthly recalculation
  - Overspend detection
  - Budget vs actual analysis
- **Endpoints:**
  - `POST /budgets` - Create budget plan
  - `GET /budgets` - List budgets
  - `GET /budgets/current` - Get active budget
  - `GET /budgets/:id/analysis` - Budget analysis

### 6. **Receipt Service** 🧾
- **Responsibility:** Receipt handling, OCR, and parsing
- **Features:**
  - Image upload to S3
  - OCR processing
  - Confidence scoring
  - Automatic transaction creation
- **Endpoints:**
  - `POST /receipts/upload` - Upload receipt
  - `GET /receipts` - List receipts
  - `GET /receipts/:id` - Get receipt details
  - `POST /receipts/:id/parse` - Trigger OCR parsing

### 7. **Analytics Service** 📊
- **Responsibility:** Data aggregation and analytics
- **Features:**
  - Monthly summaries
  - Category breakdown
  - Spending trends
  - Baseline calculations
- **Endpoints:**
  - `GET /analytics/summary` - Period summary
  - `GET /analytics/categories` - Category analysis
  - `GET /analytics/trends` - Trend analysis
  - `GET /analytics/baselines` - Spending baselines

### 8. **AI Advisor Service** 🤖
- **Responsibility:** OpenAI integration and financial insights
- **Features:**
  - Context builder from user data
  - Multi-turn conversations
  - Insight generation
  - Recommendation engine
- **Endpoints:**
  - `POST /advisor/chat` - Chat endpoint
  - `GET /advisor/insights` - Automated insights
  - `GET /advisor/recommendations` - Get recommendations

### 9. **Stripe Service** 💳
- **Responsibility:** Payment processing and subscription management
- **Features:**
  - Customer creation
  - Subscription management
  - Webhook handling
  - Invoice tracking
- **Endpoints:**
  - `POST /billing/subscribe` - Create subscription
  - `PUT /billing/subscription` - Modify subscription
  - `DELETE /billing/subscription` - Cancel subscription
  - `GET /billing/invoices` - List invoices

---

## Database Schema (PostgreSQL)

```
Tables:
├── users
│   ├── id (PK)
│   ├── email (unique)
│   ├── name
│   ├── password_hash (nullable)
│   ├── subscription_tier
│   ├── created_at
│   └── updated_at
├── accounts (OAuth)
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── provider
│   ├── provider_account_id
│   └── ...
├── sessions
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── expires_at
│   └── ...
├── transactions
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── amount
│   ├── description
│   ├── category_id (FK)
│   ├── date
│   ├── type (income/expense)
│   ├── receipt_id (FK, nullable)
│   ├── created_at
│   └── updated_at
├── categories
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── name
│   ├── color
│   ├── icon
│   ├── is_system (default)
│   └── created_at
├── budgets
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── month
│   ├── year
│   ├── total_income
│   ├── rules (JSON)
│   └── created_at
├── budget_allocations
│   ├── id (PK)
│   ├── budget_id (FK)
│   ├── category_id (FK)
│   ├── allocated_amount
│   ├── actual_spent
│   └── ...
├── receipts
│   ├── id (PK)
│   ├── user_id (FK)
│   ├── file_path (S3)
│   ├── raw_text (OCR)
│   ├── parsed_data (JSON)
│   ├── confidence
│   ├── status (pending/parsed)
│   └── created_at
└── stripe_customers
    ├── id (PK)
    ├── user_id (FK, unique)
    ├── stripe_customer_id
    └── ...
```

---

## Data Flow Examples

### Example 1: Manual Transaction Entry
```
User Input (Frontend)
    ↓
POST /transactions (NestJS)
    ↓
Prisma Transaction.create()
    ↓
PostgreSQL Insert
    ↓
Response with TX ID
    ↓
Frontend Updates Dashboard
```

### Example 2: Receipt Processing
```
User Uploads Receipt (Frontend)
    ↓
POST /receipts/upload → S3
    ↓
Receipt Service triggers OCR
    ↓
OpenAI Vision (or Tesseract)
    ↓
Receipt.parsed_data = JSON
    ↓
Auto-create Transaction
    ↓
POST /transactions (backend)
    ↓
Dashboard updates with new TX
```

### Example 3: Budget Calculation
```
Monthly Trigger (Cron Job)
    ↓
Budget Service calculates allocation
    ↓
Formula: income × allocation % = amount
    ↓
Create budget_allocations
    ↓
Query actuals from transactions
    ↓
Calculate: budget vs actual
    ↓
Store comparisons
    ↓
Frontend displays budget page
```

### Example 4: AI Advisor
```
User Message (Frontend)
    ↓
POST /advisor/chat {message, userId}
    ↓
AI Service fetches user context:
  - Recent transactions
  - Baselines
  - Spending patterns
    ↓
Build prompt with context
    ↓
Call OpenAI API
    ↓
Stream/Return response
    ↓
Frontend displays in chat UI
```

---

## Package Organization

### `/packages/db`
- Prisma schema definition
- Database migrations
- Generated Prisma client
- Seed scripts

### `/packages/shared`
- TypeScript type definitions
- Shared interfaces
- Utility functions
- Constants

### `/apps/web`
- Next.js frontend
- Page components
- API routes (for auth, etc.)
- UI components (shadcn/ui)

### `/apps/api`
- NestJS backend
- Service layer
- Controllers
- Middleware
- Guards & Decorators

---

## Security Considerations

1. **Authentication:**
   - All endpoints require Auth.js session validation
   - JWT tokens in httpOnly cookies

2. **Authorization:**
   - RBAC per service
   - User-scoped data queries
   - Subscription tier checks

3. **Database:**
   - Encrypted sensitive fields (passwords)
   - SQL injection prevention (Prisma)
   - Row-level security via user_id

4. **API:**
   - Rate limiting per user
   - CORS configuration
   - Request validation with Zod/class-validator

5. **Storage:**
   - S3 bucket encryption
   - Pre-signed URLs for uploads
   - Virus scanning for receipts

6. **Payments:**
   - PCI compliance via Stripe
   - No sensitive data in logs
   - Webhook signature verification

---

## Scalability Notes

1. **Frontend:** Vercel deployment (serverless)
2. **API:** Container deployment (Docker on AWS/GCP)
3. **Database:** PostgreSQL with read replicas for analytics
4. **Cache:** Redis for session & frequently accessed data
5. **Async Jobs:** Bull/RabbitMQ for receipt processing
6. **Files:** S3 for unlimited storage
7. **AI:** Streaming OpenAI calls to reduce latency

---

**Last Updated:** 2026-04-17
