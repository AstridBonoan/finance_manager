'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, BarChart3 } from 'lucide-react';
import { BudgetForm, BudgetFormData } from './BudgetForm';
import { BudgetWidget } from './BudgetWidget';
import { AllocationDashboard } from './AllocationDashboard';

interface Category {
  id: string;
  name: string;
  icon: string;
}

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

interface BudgetPageProps {
  budgetId: string;
  userId: string;
  month: number;
  year: number;
  totalIncome: number;
  categories: Category[];
  allocations: BudgetAllocation[];
  rules: AllocationRule[];
  recommendations: AllocationResult[];
  currentAllocations: AllocationResult[];
  onCreateAllocation?: (data: BudgetFormData) => Promise<void>;
  onUpdateAllocation?: (id: string, data: BudgetFormData) => Promise<void>;
  onDeleteAllocation?: (id: string) => Promise<void>;
  onUpdateRules?: (categoryId: string, percentage: number) => Promise<void>;
  isLoading?: boolean;
}

export function BudgetPage({
  month,
  year,
  totalIncome,
  categories,
  allocations,
  rules,
  recommendations,
  currentAllocations,
  onCreateAllocation,
  onUpdateAllocation,
  onDeleteAllocation,
  onUpdateRules,
  isLoading = false,
}: BudgetPageProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState<BudgetAllocation | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Format month/year display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthDisplay = `${monthNames[month - 1]} ${year}`;

  const handleEditAllocation = (allocation: BudgetAllocation) => {
    setEditingAllocation(allocation);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: BudgetFormData) => {
    setSubmitLoading(true);
    try {
      if (editingAllocation && onUpdateAllocation) {
        await onUpdateAllocation(editingAllocation.id, data);
      } else if (onCreateAllocation) {
        await onCreateAllocation(data);
      }
      setEditingAllocation(null);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this allocation?')) {
      setSubmitLoading(true);
      try {
        if (onDeleteAllocation) {
          await onDeleteAllocation(id);
        }
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalAllocated = allocations.reduce((sum, a) => sum + a.allocated, 0);
    const totalSpent = allocations.reduce((sum, a) => sum + a.spent, 0);
    const averageUsage = allocations.length > 0
      ? allocations.reduce((sum, a) => sum + a.usagePercentage, 0) / allocations.length
      : 0;

    const overBudgetCount = allocations.filter((a) => a.usagePercentage >= 100).length;
    const warningCount = allocations.filter(
      (a) => a.usagePercentage >= 80 && a.usagePercentage < 100
    ).length;

    return {
      totalAllocated,
      totalSpent,
      totalRemaining: totalAllocated - totalSpent,
      averageUsage,
      overBudgetCount,
      warningCount,
      allocationCount: allocations.length,
    };
  }, [allocations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-600 mt-1">{monthDisplay}</p>
          <p className="text-sm text-gray-500 mt-1">Monthly income: ${totalIncome.toFixed(2)}</p>
        </div>
        <Button onClick={() => {
          setEditingAllocation(null);
          setFormOpen(true);
        }} disabled={isLoading || submitLoading}>
          <Plus className="mr-2" size={20} />
          Add Allocation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Allocations</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.allocationCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Allocated</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">${stats.totalAllocated.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.totalAllocated / totalIncome) * 100).toFixed(1)}% of income
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Avg Usage</p>
            <p className={`text-3xl font-bold mt-2 ${
              stats.averageUsage >= 100 ? 'text-red-600' :
              stats.averageUsage >= 80 ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {stats.averageUsage.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Alerts</p>
            <div className="flex gap-2 mt-2">
              {stats.overBudgetCount > 0 && (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  {stats.overBudgetCount}
                </span>
              )}
              {stats.warningCount > 0 && (
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold">
                  {stats.warningCount}
                </span>
              )}
              {stats.overBudgetCount === 0 && stats.warningCount === 0 && (
                <span className="text-gray-500 text-sm">None</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Monthly Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Total Income</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${totalIncome.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Allocated</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalAllocated.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Unallocated: ${(totalIncome - stats.totalAllocated).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalSpent.toFixed(2)}</p>
                  <p className={`text-xs mt-1 ${stats.totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.totalRemaining >= 0 ? 'Remaining' : 'Over'}: ${Math.abs(stats.totalRemaining).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <BudgetWidget
            allocations={allocations}
            onEdit={handleEditAllocation}
            onDelete={handleDeleteAllocation}
            isLoading={submitLoading}
          />
        </TabsContent>

        {/* Allocations Tab */}
        <TabsContent value="allocations">
          <BudgetWidget
            allocations={allocations}
            onEdit={handleEditAllocation}
            onDelete={handleDeleteAllocation}
            isLoading={submitLoading}
          />
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <AllocationDashboard
            rules={rules}
            recommendations={recommendations}
            currentAllocations={currentAllocations}
            totalIncome={totalIncome}
            onUpdateRule={onUpdateRules}
            isLoading={submitLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Budget Form Modal */}
      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        categories={categories}
        onSubmit={handleFormSubmit}
        initialData={editingAllocation ? {
          categoryId: editingAllocation.categoryId,
          amount: editingAllocation.allocated,
          percentOfIncome: undefined,
        } : undefined}
        isLoading={submitLoading}
      />
    </div>
  );
}
