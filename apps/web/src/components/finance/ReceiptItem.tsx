interface ReceiptItemProps {
  merchant: string;
  date: string;
  amount: number;
}

export function ReceiptItem({ merchant, date, amount }: ReceiptItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-slate-900">{merchant}</p>
        <p className="text-xs text-slate-500">{date}</p>
      </div>
      <p className="text-sm font-semibold text-emerald-700">${amount.toFixed(2)}</p>
    </div>
  );
}
