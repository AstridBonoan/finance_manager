'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Finance Manager</h1>
        <p className="text-xl text-slate-300 mb-8">
          Your personal AI-powered financial management system
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">💰 Budget Manager</h3>
            <p className="text-slate-300 text-sm">Smart budget allocation and tracking</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">📊 Analytics</h3>
            <p className="text-slate-300 text-sm">Spending analysis and trends</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
            <h3 className="text-lg font-semibold text-white mb-2">🤖 AI Advisor</h3>
            <p className="text-slate-300 text-sm">Financial insights and recommendations</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition">
            Get Started
          </button>
          <Link
            href="/api/health"
            className="border border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            API Status
          </Link>
        </div>

        <div className="mt-12 text-slate-400 text-sm">
          <p>🚀 Sprint 1: Foundation Setup in Progress</p>
        </div>
      </div>
    </main>
  );
}
