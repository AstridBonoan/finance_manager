"use client";

import { useState } from "react";

type CaptureState = "capture" | "review";

export default function ScanPage() {
  const [state, setState] = useState<CaptureState>("capture");
  const [preview] = useState({
    merchant: "Trader Joe's",
    amount: 42.18,
    category: "Groceries",
    date: new Date().toLocaleDateString(),
  });

  if (state === "review") {
    return (
      <div className="space-y-4">
        <header>
          <h1 className="text-xl font-semibold text-slate-900">Confirm Receipt</h1>
          <p className="text-sm text-slate-500">Review and confirm extracted details.</p>
        </header>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Merchant</span>
              <span className="font-medium text-slate-900">{preview.merchant}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount</span>
              <span className="font-medium text-slate-900">${preview.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-medium text-slate-900">{preview.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date</span>
              <span className="font-medium text-slate-900">{preview.date}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white">Confirm</button>
          <button
            className="rounded-xl bg-white py-3 text-sm font-semibold text-slate-900 shadow-sm"
            onClick={() => setState("capture")}
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">Scan Receipt</h1>
        <p className="text-sm text-slate-500">Capture your receipt and review details in seconds.</p>
      </header>

      <section className="h-96 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-center p-6">
        <div>
          <p className="text-sm font-medium text-slate-700">Camera preview area</p>
          <p className="mt-1 text-xs text-slate-500">Your captured receipt will appear here.</p>
        </div>
      </section>

      <button
        className="w-full rounded-xl bg-emerald-600 py-4 text-sm font-semibold text-white"
        onClick={() => setState("review")}
      >
        Capture Receipt
      </button>
    </div>
  );
}
