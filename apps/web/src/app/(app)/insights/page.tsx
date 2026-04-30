"use client";

import { useEffect, useState } from "react";
import { InsightCard } from "@/components/finance/InsightCard";
import { apiFetch } from "@/lib/api";

interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const response = await apiFetch(`/analytics/dashboard?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
        if (response.ok) {
          setData(await response.json());
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  const savingsRate = data?.totalIncome ? ((data.totalIncome - data.totalExpenses) / data.totalIncome) * 100 : 0;

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Insights</h1>
        <p className="text-sm text-slate-500">Trends, comparisons, and important alerts.</p>
      </header>

      <InsightCard
        title="Savings rate"
        description={`You saved ${savingsRate.toFixed(1)}% of this month income.`}
        tone={savingsRate >= 20 ? "success" : "default"}
      />
      <InsightCard
        title="Expense comparison"
        description={`Current expenses: $${(data?.totalExpenses ?? 0).toFixed(2)} this month.`}
      />
      <InsightCard
        title="Balance alert"
        description={
          (data?.balance ?? 0) < 0
            ? "Your balance is negative. Reduce discretionary spending."
            : "Your balance is healthy. Keep your current budget pace."
        }
        tone={(data?.balance ?? 0) < 0 ? "warning" : "success"}
      />
    </div>
  );
}
