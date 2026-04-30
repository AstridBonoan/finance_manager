"use client";

import { useEffect, useState } from "react";
import { TransactionItem } from "@/components/finance/TransactionItem";
import { apiFetch } from "@/lib/api";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  category?: { name: string };
}

export default function LedgerPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await apiFetch("/transactions?page=1&pageSize=25");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setTransactions(data.items ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Ledger</h1>
        <p className="text-sm text-slate-500">Chronological transaction history.</p>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
          No transactions yet. Add your first income or expense.
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              merchant={tx.description}
              category={tx.category?.name || "Uncategorized"}
              date={new Date(tx.date).toLocaleDateString()}
              amount={tx.amount}
              type={tx.type}
            />
          ))}
        </div>
      )}
    </div>
  );
}
