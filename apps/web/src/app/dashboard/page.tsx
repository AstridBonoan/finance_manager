'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { DashboardSummary } from '@/components/dashboard/DashboardSummary';
import { FinancialMemoryPanel } from '@/components/dashboard/FinancialMemoryPanel';
import { AdvisorPanel } from '@/components/dashboard/AdvisorPanel';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionList } from '@/components/transactions/TransactionList';
import { CategoryManagement } from '@/components/categories/CategoryManagement';
import { CreditCard } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'categories'>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!session) {
    redirect('/login');
  }

  const userId = session.user?.id || '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Personal Finance Manager</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, {session.user?.email}</p>
            </div>
            <Link
              href="/billing"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Categories
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardSummary userId={userId} />
            <FinancialMemoryPanel userId={userId} />
            <AdvisorPanel userId={userId} />
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-8">
            <TransactionForm userId={userId} onSuccess={() => setRefreshTrigger((p) => p + 1)} />
            <TransactionList userId={userId} refreshTrigger={refreshTrigger} />
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <CategoryManagement userId={userId} refreshTrigger={refreshTrigger} />
          </div>
        )}
      </main>
    </div>
  );
}
