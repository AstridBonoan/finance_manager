"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BalanceCard } from "@/components/finance/BalanceCard";
import { InsightCard } from "@/components/finance/InsightCard";
import { ReceiptItem } from "@/components/finance/ReceiptItem";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { apiFetch } from "@/lib/api";

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

interface Receipt {
  id: string;
  extractedData?: {
    vendor?: string;
    total?: number;
    date?: string;
  };
  createdAt: string;
}

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const query = new URLSearchParams({
          month: String(now.getMonth() + 1),
          year: String(now.getFullYear()),
        });

        const [dashboardRes, receiptsRes] = await Promise.all([
          apiFetch(`/analytics/dashboard?${query}`),
          apiFetch("/receipts?page=1&pageSize=3"),
        ]);

        if (dashboardRes.ok) {
          setDashboard(await dashboardRes.json());
        }

        if (receiptsRes.ok) {
          const data = await receiptsRes.json();
          setReceipts(data.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const income = dashboard?.totalIncome ?? 0;
  const expenses = dashboard?.totalExpenses ?? 0;
  const spendingUsage = income > 0 ? (expenses / income) * 100 : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-36 animate-pulse rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-40 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-sm text-slate-500">Here&apos;s your financial overview</p>
      </header>

      <BalanceCard totalBalance={dashboard?.balance ?? 0} income={income} expenses={expenses} />

      <section className="grid grid-cols-2 gap-3">
        <Link href="/scan" className="rounded-xl bg-emerald-600 p-4 text-center text-sm font-semibold text-white shadow-sm">
          Scan Receipt
        </Link>
        <button className="rounded-xl bg-white p-4 text-sm font-semibold text-slate-900 shadow-sm">Add Expense</button>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Spending This Month</h2>
          <span className="text-xs text-slate-500">{spendingUsage.toFixed(0)}% used</span>
        </div>
        <ProgressBar value={spendingUsage} tone={spendingUsage > 90 ? "warning" : "default"} />
        <p className="mt-2 text-xs text-slate-500">
          ${expenses.toFixed(2)} spent of ${income.toFixed(2)} income
        </p>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Recent Receipts</h2>
          <Link href="/ledger" className="text-xs font-medium text-emerald-700">
            View all
          </Link>
        </div>
        {receipts.length === 0 ? (
          <div className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">No receipts yet. Scan your first receipt.</div>
        ) : (
          receipts.map((receipt) => (
            <ReceiptItem
              key={receipt.id}
              merchant={receipt.extractedData?.vendor || "Unknown merchant"}
              amount={receipt.extractedData?.total || 0}
              date={new Date(receipt.extractedData?.date || receipt.createdAt).toLocaleDateString()}
            />
          ))
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">Insights</h2>
        <InsightCard
          title="Spending trend"
          description="You are spending less on groceries than last month."
          tone="success"
        />
        <InsightCard
          title="Budget alert"
          description="Dining out is nearing your monthly limit."
          tone="warning"
        />
      </section>
    </div>
  );
}
