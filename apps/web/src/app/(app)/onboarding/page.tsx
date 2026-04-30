"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface Category {
  id: string;
  name: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    monthlyIncome: "",
    savingsGoal: "",
    timeline: "6-months",
    priority: "balanced",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const monthlyIncome = Number(form.monthlyIncome);
      const savingsGoal = Number(form.savingsGoal);

      if (!monthlyIncome || monthlyIncome <= 0) {
        setError("Please enter a valid monthly income.");
        return;
      }

      if (!savingsGoal || savingsGoal <= 0) {
        setError("Please enter a valid savings goal.");
        return;
      }

      const categoriesRes = await apiFetch("/categories");
      let categories: Category[] = [];
      if (categoriesRes.ok) {
        categories = await categoriesRes.json();
      }

      if (categories.length === 0) {
        const defaultsRes = await apiFetch("/categories/defaults", { method: "POST" });
        if (!defaultsRes.ok) {
          throw new Error("Failed to initialize categories.");
        }
        const refreshRes = await apiFetch("/categories");
        categories = refreshRes.ok ? await refreshRes.json() : [];
      }

      const now = new Date();
      const budgetRes = await apiFetch("/budgets/monthly", {
        method: "POST",
        body: JSON.stringify({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          totalIncome: monthlyIncome,
        }),
      });

      if (!budgetRes.ok) {
        throw new Error("Failed to create monthly budget.");
      }

      const budget = await budgetRes.json();
      const savingsCategory =
        categories.find((c) => c.name.toLowerCase() === "savings") ?? categories[0];

      if (!savingsCategory) {
        throw new Error("No category available to attach your goal.");
      }

      const percentage = Math.min(100, (savingsGoal / monthlyIncome) * 100);
      const goalAllocationRes = await apiFetch("/budgets", {
        method: "POST",
        body: JSON.stringify({
          budgetId: budget.id,
          categoryId: savingsCategory.id,
          amount: savingsGoal,
          percentOfIncome: Number(percentage.toFixed(2)),
        }),
      });

      if (!goalAllocationRes.ok) {
        const currentAllocationsRes = await apiFetch(`/budgets?budgetId=${budget.id}`);
        if (currentAllocationsRes.ok) {
          const allocations = await currentAllocationsRes.json();
          const hasSavingsGoal = allocations.some(
            (allocation: { categoryId: string }) => allocation.categoryId === savingsCategory.id,
          );
          if (!hasSavingsGoal) {
            throw new Error("Failed to create savings goal.");
          }
        }
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete onboarding.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-4">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-slate-900">Set up your goal</h1>
        <p className="mt-1 text-sm text-slate-500">
          Answer a few questions so we can personalize your finance plan.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Monthly income</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="5200"
            inputMode="decimal"
            value={form.monthlyIncome}
            onChange={(e) => setForm((prev) => ({ ...prev, monthlyIncome: e.target.value }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Monthly savings goal</label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="1200"
            inputMode="decimal"
            value={form.savingsGoal}
            onChange={(e) => setForm((prev) => ({ ...prev, savingsGoal: e.target.value }))}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Goal timeline</p>
          <div className="grid grid-cols-3 gap-2">
            {["3-months", "6-months", "12-months"].map((timeline) => (
              <button
                key={timeline}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, timeline }))}
                className={`rounded-xl border px-3 py-2 text-xs font-medium ${
                  form.timeline === timeline
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {timeline.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Financial priority</p>
          <div className="grid grid-cols-3 gap-2">
            {["conservative", "balanced", "aggressive"].map((priority) => (
              <button
                key={priority}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, priority }))}
                className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize ${
                  form.priority === priority
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <button
          disabled={loading}
          className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Finish setup"}
        </button>
      </form>
    </div>
  );
}
