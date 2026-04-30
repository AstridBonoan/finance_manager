import { ProgressBar } from "@/components/ui/ProgressBar";

interface BudgetProgressProps {
  category: string;
  used: number;
  limit: number;
}

export function BudgetProgress({ category, used, limit }: BudgetProgressProps) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const tone = percentage >= 100 ? "danger" : percentage >= 80 ? "warning" : "default";

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-slate-900">{category}</p>
        <p className="text-sm text-slate-600">
          ${used.toFixed(2)} / ${limit.toFixed(2)}
        </p>
      </div>
      <ProgressBar value={percentage} tone={tone} />
      <p className={`mt-2 text-xs ${percentage >= 100 ? "text-rose-600" : "text-slate-500"}`}>
        {percentage.toFixed(0)}% used
      </p>
    </div>
  );
}
