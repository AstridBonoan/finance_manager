import { CategoryBadge } from "@/components/ui/CategoryBadge";

interface TransactionItemProps {
  merchant: string;
  category: string;
  date: string;
  amount: number;
  type: "income" | "expense";
}

export function TransactionItem({ merchant, category, date, amount, type }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-slate-900">{merchant}</p>
        <div className="mt-1 flex items-center gap-2">
          <CategoryBadge label={category} />
          <span className="text-xs text-slate-500">{date}</span>
        </div>
      </div>
      <p className={`text-sm font-semibold ${type === "income" ? "text-emerald-700" : "text-rose-600"}`}>
        {type === "income" ? "+" : "-"}${Math.abs(amount).toFixed(2)}
      </p>
    </div>
  );
}
