'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface AllocationRule {
  categoryId: string;
  categoryName: string;
  percentage: number;
  icon?: string;
}

interface AllocationResult {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  percentage: number;
  icon?: string;
}

interface AllocationDashboardProps {
  rules: AllocationRule[];
  recommendations: AllocationResult[];
  currentAllocations: AllocationResult[];
  totalIncome: number;
  onUpdateRule?: (categoryId: string, newPercentage: number) => Promise<void>;
  isLoading?: boolean;
}

export function AllocationDashboard({
  rules,
  recommendations,
  currentAllocations,
  totalIncome,
  onUpdateRule,
  isLoading = false,
}: AllocationDashboardProps) {
  const totalRulePercentage = rules.reduce((sum, r) => sum + r.percentage, 0);
  const totalRecommendedPercentage = recommendations.reduce((sum, r) => sum + r.percentage, 0);

  return (
    <div className="space-y-6">
      {/* Allocation Rules Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Rules</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Monthly income: <strong>${totalIncome.toFixed(2)}</strong>
          </p>
        </CardHeader>
        <CardContent>
          {totalRulePercentage > 100 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} />
              Total allocation exceeds 100% ({totalRulePercentage.toFixed(1)}%)
            </div>
          )}

          {totalRulePercentage < 100 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-center gap-2 text-sm text-blue-700">
              <AlertCircle size={16} />
              Unallocated: {(100 - totalRulePercentage).toFixed(1)}%
            </div>
          )}

          <div className="space-y-3">
            {rules.length === 0 ? (
              <p className="text-gray-500 text-sm">No allocation rules set</p>
            ) : (
              rules.map((rule) => (
                <div key={rule.categoryId} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rule.icon || '📁'}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{rule.categoryName}</h4>
                        <p className="text-sm text-gray-600">
                          ${(totalIncome * (rule.percentage / 100)).toFixed(2)} per month
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{rule.percentage.toFixed(1)}%</span>
                  </div>

                  {/* Editable Percentage Slider */}
                  {onUpdateRule && (
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={rule.percentage}
                        onChange={(e) => {
                          const newPercentage = parseFloat(e.target.value);
                          onUpdateRule(rule.categoryId, newPercentage);
                        }}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <span className="text-sm font-semibold text-gray-700 min-w-[50px]">
                        {rule.percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommended vs Current Allocations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations vs Current</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Based on your spending history
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <p className="text-gray-500 text-sm">No spending history to recommend</p>
            ) : (
              recommendations.map((rec) => {
                const current = currentAllocations.find((a) => a.categoryId === rec.categoryId);
                const difference = rec.percentage - (current?.percentage || 0);

                return (
                  <div key={rec.categoryId} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{rec.icon || '📁'}</span>
                      <h4 className="font-medium text-gray-900">{rec.categoryName}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Recommended</p>
                        <p className="font-semibold text-gray-900">{rec.percentage.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Current</p>
                        <p className="font-semibold text-gray-900">
                          {(current?.percentage || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Difference</p>
                        <p className={`font-semibold ${difference > 0 ? 'text-blue-600' : difference < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {difference > 0 ? '+' : ''}{difference.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {/* Visual Comparison Bars */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 min-w-[80px]">Recommended</span>
                        <div className="flex-1 bg-blue-100 rounded h-2" style={{
                          width: `${rec.percentage}%`,
                        }} />
                      </div>
                      {current && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 min-w-[80px]">Current</span>
                          <div className="flex-1 bg-green-100 rounded h-2" style={{
                            width: `${current.percentage}%`,
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Rules</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{rules.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Allocated %</p>
            <p className={`text-3xl font-bold mt-1 ${totalRulePercentage === 100 ? 'text-green-600' : totalRulePercentage > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
              {totalRulePercentage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Monthly Allocations</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              ${(totalIncome * (totalRulePercentage / 100)).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Recommendations</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{recommendations.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
