interface BalanceCardProps {
  totalBalance: number;
  income: number;
  expenses: number;
}

export function BalanceCard({ totalBalance, income, expenses }: BalanceCardProps) {
  const budgetLeft = income - expenses;

  return (
    <section className="rounded-2xl bg-gradient-to-br from-emerald-900 to-emerald-700 p-5 text-white shadow-sm">
      <p className="text-sm text-emerald-100">Total Balance</p>
      <p className="mt-1 text-4xl font-semibold">${totalBalance.toFixed(2)}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-emerald-200">Income</p>
          <p className="mt-1 font-semibold">${income.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-emerald-200">Expenses</p>
          <p className="mt-1 font-semibold">${expenses.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-emerald-200">Budget Left</p>
          <p className="mt-1 font-semibold">${budgetLeft.toFixed(2)}</p>
        </div>
      </div>
    </section>
  );
}
