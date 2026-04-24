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

interface Anomaly {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  isReviewed: boolean;
  userFeedback?: 'normal' | 'flag' | 'ignore' | null;
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
  recentAnomalies: Anomaly[];
  generatedAt: string;
}

interface MemoryStatus {
  baselineCount: number;
  trendCount: number;
  anomalyCount: number;
  lastMemoryCalculationAt: string | null;
}

export function FinancialMemoryPanel({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [status, setStatus] = useState<MemoryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewingAnomalyId, setReviewingAnomalyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      const [summaryResponse, statusResponse] = await Promise.all([
        apiFetch('/financial-memory/summary'),
        apiFetch('/financial-memory/status'),
      ]);
      if (!summaryResponse.ok) throw new Error('Failed to load financial memory summary');
      if (!statusResponse.ok) throw new Error('Failed to load financial memory status');
      const summaryResult = await summaryResponse.json();
      const statusResult = await statusResponse.json();
      setSummary(summaryResult.summary);
      setStatus(statusResult.status);
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

  const reviewAnomaly = async (
    anomalyId: string,
    feedback: 'normal' | 'flag' | 'ignore',
  ) => {
    setReviewingAnomalyId(anomalyId);
    try {
      const response = await apiFetch(
        `/financial-memory/anomalies/${anomalyId}/review?feedback=${feedback}`,
        { method: 'POST' },
      );
      if (!response.ok) throw new Error('Failed to submit anomaly feedback');
      await loadSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setReviewingAnomalyId(null);
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

      <p className="text-xs text-gray-500">
        Last calculated:{' '}
        {status?.lastMemoryCalculationAt
          ? new Date(status.lastMemoryCalculationAt).toLocaleString()
          : 'Never'}
      </p>

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

      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Anomalies</h4>
        {summary.recentAnomalies.length === 0 ? (
          <p className="text-sm text-gray-500">No anomalies detected.</p>
        ) : (
          <div className="space-y-2">
            {summary.recentAnomalies.map((anomaly) => (
              <div key={anomaly.id} className="border rounded p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{anomaly.description}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {anomaly.type} • severity: {anomaly.severity}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      anomaly.isReviewed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {anomaly.isReviewed ? `Reviewed (${anomaly.userFeedback || 'n/a'})` : 'Needs review'}
                  </span>
                </div>

                {!anomaly.isReviewed && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => reviewAnomaly(anomaly.id, 'normal')}
                      disabled={reviewingAnomalyId === anomaly.id}
                      className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                      Mark Normal
                    </button>
                    <button
                      onClick={() => reviewAnomaly(anomaly.id, 'flag')}
                      disabled={reviewingAnomalyId === anomaly.id}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      Flag
                    </button>
                    <button
                      onClick={() => reviewAnomaly(anomaly.id, 'ignore')}
                      disabled={reviewingAnomalyId === anomaly.id}
                      className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                    >
                      Ignore
                    </button>
                  </div>
                )}
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

