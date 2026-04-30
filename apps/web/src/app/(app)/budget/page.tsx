"use client";

import { useEffect, useState } from "react";
import { BudgetProgress } from "@/components/finance/BudgetProgress";
import { apiFetch } from "@/lib/api";

interface Allocation {
  id: string;
  categoryName: string;
  allocated: number;
  spent: number;
}

export default function BudgetPage() {
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const budgetRes = await apiFetch(`/budgets/monthly?month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
        if (!budgetRes.ok) {
          return;
        }

        const budget = await budgetRes.json();
        if (!budget?.id) {
          return;
        }

        const response = await apiFetch(`/budgets?budgetId=${budget.id}`);
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setAllocations(data ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Budget</h1>
        <p className="text-sm text-slate-500">Track category budgets and stay on plan.</p>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
        </div>
      ) : allocations.length === 0 ? (
        <div className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
          No category budgets set yet. Add your first budget allocation.
        </div>
      ) : (
        <div className="space-y-3">
          {allocations.map((allocation) => (
            <BudgetProgress
              key={allocation.id}
              category={allocation.categoryName}
              used={allocation.spent}
              limit={allocation.allocated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
