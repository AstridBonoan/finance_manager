'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Habit {
  key: string;
  description: string;
  categoryName: string;
  occurrenceCount: number;
  averageAmount: number;
  cadence: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
}

interface MemorySummary {
  baselineCount: number;
  trendCount: number;
  habitCount: number;
  anomalyCount: number;
  unresolvedAnomalyCount: number;
  highSeverityAnomalyCount: number;
  recurringHabitCount: number;
  topHabits: Habit[];
  generatedAt: string;
}

export function FinancialMemoryPanel({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      const response = await apiFetch('/financial-memory/summary');
      if (!response.ok) throw new Error('Failed to load financial memory summary');
      const result = await response.json();
      setSummary(result.summary);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshMemory = async () => {
    setRefreshing(true);
    try {
      const response = await apiFetch('/financial-memory/refresh', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to refresh financial memory');
      await loadSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadSummary();
    }
  }, [userId]);

  if (loading) return <div className="bg-white rounded-lg shadow p-6">Loading financial memory...</div>;
  if (error) return <div className="bg-white rounded-lg shadow p-6 text-red-600">Error: {error}</div>;
  if (!summary) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Financial Memory</h3>
        <button
          onClick={refreshMemory}
          disabled={refreshing}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-2 rounded disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh Memory'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Baselines" value={summary.baselineCount} />
        <Stat label="Trends" value={summary.trendCount} />
        <Stat label="Habits" value={summary.habitCount} />
        <Stat label="Anomalies" value={summary.anomalyCount} />
        <Stat label="Unresolved" value={summary.unresolvedAnomalyCount} />
        <Stat label="High Severity" value={summary.highSeverityAnomalyCount} />
        <Stat label="Recurring Habits" value={summary.recurringHabitCount} />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Top Habits</h4>
        {summary.topHabits.length === 0 ? (
          <p className="text-sm text-gray-500">No habits detected yet.</p>
        ) : (
          <div className="space-y-2">
            {summary.topHabits.map((habit) => (
              <div key={habit.key} className="border rounded p-2 flex justify-between text-sm">
                <span className="text-gray-700">
                  {habit.description} ({habit.categoryName}) - {habit.cadence}
                </span>
                <span className="font-medium text-gray-900">
                  {habit.occurrenceCount}x | ${habit.averageAmount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded p-3">
      <p className="text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}

