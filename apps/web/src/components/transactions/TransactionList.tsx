'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category?: {
    name: string;
    icon?: string;
  };
}

interface TransactionListProps {
  userId: string;
  refreshTrigger?: number;
}

export function TransactionList({ userId, refreshTrigger }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'income' | 'expense',
    page: 1,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(filters.page),
          pageSize: '20',
          ...(filters.type !== 'all' && { type: filters.type }),
        });

        const response = await apiFetch(`/transactions?${params}`);

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTransactions();
    }
  }, [userId, filters.page, filters.type, refreshTrigger]);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await apiFetch(`/transactions/${transactionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete transaction');
      }

      setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-8">Error: {error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Transactions</h2>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value as any, page: 1 })}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-gray-600 font-semibold">Date</th>
                <th className="text-left py-2 px-4 text-gray-600 font-semibold">Description</th>
                <th className="text-left py-2 px-4 text-gray-600 font-semibold">Category</th>
                <th className="text-left py-2 px-4 text-gray-600 font-semibold">Type</th>
                <th className="text-right py-2 px-4 text-gray-600 font-semibold">Amount</th>
                <th className="text-right py-2 px-4 text-gray-600 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{tx.description}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {tx.category ? (
                      <span>
                        {tx.category.icon} {tx.category.name}
                      </span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        tx.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {tx.type === 'income' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
