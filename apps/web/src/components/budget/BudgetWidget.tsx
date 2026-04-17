'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Trash2, Edit2 } from 'lucide-react';

interface BudgetAllocation {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  allocated: number;
  spent: number;
  remaining: number;
  usagePercentage: number;
}

interface BudgetWidgetProps {
  allocations: BudgetAllocation[];
  onEdit?: (allocation: BudgetAllocation) => void;
  onDelete?: (allocationId: string) => Promise<void>;
  isLoading?: boolean;
}

function getStatusColor(percentage: number): string {
  if (percentage >= 100) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getStatusLabel(percentage: number): string {
  if (percentage >= 100) return 'Over Budget';
  if (percentage >= 80) return 'Warning';
  return 'On Track';
}

function getStatusBgClass(percentage: number): string {
  if (percentage >= 100) return 'bg-red-50 border-red-200';
  if (percentage >= 80) return 'bg-yellow-50 border-yellow-200';
  return 'bg-green-50 border-green-200';
}

function getStatusTextClass(percentage: number): string {
  if (percentage >= 100) return 'text-red-700';
  if (percentage >= 80) return 'text-yellow-700';
  return 'text-green-700';
}

export function BudgetWidget({
  allocations,
  onEdit,
  onDelete,
  isLoading = false,
}: BudgetWidgetProps) {
  if (allocations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">No budget allocations yet</p>
          <p className="text-sm text-gray-400 mt-1">Create your first allocation to get started</p>
        </CardContent>
      </Card>
    );
  }

  const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const totalSpent = allocations.reduce((sum, a) => sum + a.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Overall Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Allocated</p>
              <p className="text-2xl font-bold text-gray-900">${totalAllocated.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(totalRemaining).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">Overall Usage</p>
              <p className={`text-sm font-semibold ${getStatusTextClass(overallPercentage)}`}>
                {overallPercentage.toFixed(1)}%
              </p>
            </div>
            <Progress value={Math.min(overallPercentage, 100)} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Individual Category Allocations */}
      <div className="space-y-3">
        {allocations.map((allocation) => (
          <Card key={allocation.id} className={`border ${getStatusBgClass(allocation.usagePercentage)}`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Header with Category Name and Actions */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{allocation.categoryIcon || '📁'}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{allocation.categoryName}</h3>
                        <p className={`text-sm ${getStatusTextClass(allocation.usagePercentage)}`}>
                          {getStatusLabel(allocation.usagePercentage)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(allocation)}
                        disabled={isLoading}
                        title="Edit allocation"
                      >
                        <Edit2 size={16} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(allocation.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Delete allocation"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Amount Info */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Allocated</p>
                    <p className="font-semibold text-gray-900">${allocation.allocated.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold text-gray-900">${allocation.spent.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining</p>
                    <p className={`font-semibold ${allocation.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(allocation.remaining).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-medium text-gray-700">Usage Progress</p>
                    <p className={`text-xs font-semibold ${getStatusTextClass(allocation.usagePercentage)}`}>
                      {allocation.usagePercentage.toFixed(1)}%
                    </p>
                  </div>
                  <Progress
                    value={Math.min(allocation.usagePercentage, 100)}
                    className="h-2"
                  />
                </div>

                {/* Warning for Over Budget */}
                {allocation.usagePercentage >= 100 && (
                  <div className="bg-red-100 border border-red-300 rounded p-2 flex items-center gap-2 text-sm text-red-700">
                    <AlertTriangle size={16} />
                    <span>Over budget by ${(allocation.spent - allocation.allocated).toFixed(2)}</span>
                  </div>
                )}

                {/* Warning for Approaching Limit */}
                {allocation.usagePercentage >= 80 && allocation.usagePercentage < 100 && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-2 flex items-center gap-2 text-sm text-yellow-700">
                    <AlertTriangle size={16} />
                    <span>Approaching limit - {allocation.remaining.toFixed(2)} remaining</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
