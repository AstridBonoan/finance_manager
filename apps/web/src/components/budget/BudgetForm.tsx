'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, DollarSign, Percent } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface BudgetFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSubmit: (data: BudgetFormData) => Promise<void>;
  initialData?: BudgetFormData;
  isLoading?: boolean;
}

export interface BudgetFormData {
  categoryId: string;
  amount: number;
  percentOfIncome?: number;
}

export function BudgetForm({
  open,
  onOpenChange,
  categories,
  onSubmit,
  initialData,
  isLoading = false,
}: BudgetFormProps) {
  const [formData, setFormData] = useState<BudgetFormData>(
    initialData || {
      categoryId: '',
      amount: 0,
      percentOfIncome: undefined,
    }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof BudgetFormData, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.percentOfIncome !== undefined) {
      if (formData.percentOfIncome < 0 || formData.percentOfIncome > 100) {
        newErrors.percentOfIncome = 'Percentage must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        categoryId: '',
        amount: 0,
        percentOfIncome: undefined,
      });
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save budget allocation'
      );
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Budget Allocation' : 'Create Budget Allocation'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.categoryId} onValueChange={(value: string) => {
              setFormData({ ...formData, categoryId: value });
              setErrors({ ...errors, categoryId: undefined });
            }}>
              <SelectTrigger id="category" className={errors.categoryId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.categoryId}
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Allocated Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 });
                  setErrors({ ...errors, amount: undefined });
                }}
                className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.amount}
              </p>
            )}
          </div>

          {/* Percentage of Income (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="percentage">% of Income (Optional)</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-3 text-gray-500" size={18} />
              <Input
                id="percentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                placeholder="0.0"
                value={formData.percentOfIncome || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setFormData({
                    ...formData,
                    percentOfIncome: e.target.value ? parseFloat(e.target.value) : undefined,
                  });
                  setErrors({ ...errors, percentOfIncome: undefined });
                }}
                className={`pl-10 ${errors.percentOfIncome ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.percentOfIncome && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.percentOfIncome}
              </p>
            )}
          </div>

          {/* Display Category Info */}
          {selectedCategory && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="text-gray-700">
                <strong>Category:</strong> {selectedCategory.icon} {selectedCategory.name}
              </p>
              <p className="text-gray-700 mt-1">
                <strong>Amount:</strong> ${formData.amount.toFixed(2)}
              </p>
              {formData.percentOfIncome && (
                <p className="text-gray-700">
                  <strong>% of Income:</strong> {formData.percentOfIncome}%
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle size={16} />
              {submitError}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Allocation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
