/**
 * Shared Types for Finance Manager
 */

import { z } from 'zod';

// ==================
// API Response Types
// ==================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================
// User Types
// ==================

export type UserRole = 'user' | 'admin' | 'support';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  subscriptionTier: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

// ==================
// Transaction Types
// ==================

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: Date;
  type: TransactionType;
  categoryId?: string;
  receiptId?: string;
  notes?: string;
  tags: string[];
  isRecurring: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionWithCategory extends Transaction {
  category?: Category;
}

// Validation schemas
export const CreateTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.date(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isRecurring: z.boolean().default(false),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

// ==================
// Category Types
// ==================

export interface Category {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

// ==================
// Budget Types
// ==================

export interface BudgetAllocationRule {
  [key: string]: number; // categoryName -> percentage or fixed amount
}

export interface Budget {
  id: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  rules: BudgetAllocationRule;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  categoryId: string;
  allocatedAmount: number;
  actualSpent: number;
  percentOfIncome?: number;
  isOverBudget: boolean;
  overageAmount: number;
}

export interface BudgetWithAllocations extends Budget {
  allocations: BudgetAllocation[];
}

// ==================
// Receipt Types
// ==================

export type ReceiptStatus = 'pending' | 'parsed' | 'reviewed' | 'error';

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ParsedReceiptData {
  merchant?: string;
  date?: Date;
  items?: ReceiptItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
}

export interface Receipt {
  id: string;
  userId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  rawText?: string;
  parsedData?: ParsedReceiptData;
  confidence: number;
  status: ReceiptStatus;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================
// Spending Analysis Types
// ==================

export interface SpendingBaseline {
  categoryId: string;
  averageMonthly: number;
  minMonthly: number;
  maxMonthly: number;
  stdDeviation: number;
}

export interface SpendingTrend {
  categoryId?: string;
  month: number;
  year: number;
  amount: number;
  percentChange?: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface Anomaly {
  id: string;
  userId: string;
  categoryId?: string;
  type: 'unusual_amount' | 'unusual_frequency' | 'new_merchant';
  severity: 'low' | 'medium' | 'high';
  description: string;
  expectedAmount?: number;
  actualAmount?: number;
  deviationPercent?: number;
}

// ==================
// AI Advisor Types
// ==================

export interface AdvisorMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorConversation {
  id: string;
  userId: string;
  title?: string;
  topic?: string;
  messages: AdvisorMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialInsight {
  id: string;
  userId: string;
  type: 'spending_pattern' | 'savings_opportunity' | 'budget_alert';
  title: string;
  description: string;
  category?: string;
  recommendation?: string;
  actionUrl?: string;
  isViewed: boolean;
}

// ==================
// Payment/Billing Types
// ==================

export interface StripeCustomer {
  id: string;
  userId: string;
  stripeCustomerId: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled' | 'unpaid';
  planId?: string;
  currentPeriodEnd?: Date;
}

export type InvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export interface Invoice {
  id: string;
  userId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  invoiceDate: Date;
  dueDate?: Date;
  paidAt?: Date;
  receiptUrl?: string;
}

// ==================
// Dashboard Types
// ==================

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyTrend: SpendingTrend[];
  topCategories: Array<{
    category: Category;
    amount: number;
    percentOfTotal: number;
  }>;
  budgetStatus: Array<{
    category: string;
    allocated: number;
    spent: number;
    remaining: number;
    percentUsed: number;
  }>;
  recentTransactions: Transaction[];
  alerts: FinancialInsight[];
}
