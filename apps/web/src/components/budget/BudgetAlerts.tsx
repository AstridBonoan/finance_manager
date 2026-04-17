'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Zap, DollarSign, X } from 'lucide-react';

interface BudgetAlert {
  id: string;
  type: 'over_budget' | 'approaching_limit' | 'trend_warning';
  severity: 'critical' | 'warning' | 'info';
  categoryName: string;
  categoryIcon?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissable?: boolean;
}

interface BudgetAlertsProps {
  alerts: BudgetAlert[];
  onDismiss?: (id: string) => void;
  onActionClick?: (alert: BudgetAlert) => void;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'border-red-200 bg-red-50';
    case 'warning':
      return 'border-yellow-200 bg-yellow-50';
    default:
      return 'border-blue-200 bg-blue-50';
  }
}

function getSeverityTextColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'text-red-700';
    case 'warning':
      return 'text-yellow-700';
    default:
      return 'text-blue-700';
  }
}

function getSeverityIcon(type: string) {
  switch (type) {
    case 'over_budget':
      return <AlertTriangle className="text-red-600" size={20} />;
    case 'approaching_limit':
      return <TrendingUp className="text-yellow-600" size={20} />;
    case 'trend_warning':
      return <Zap className="text-blue-600" size={20} />;
    default:
      return <DollarSign size={20} />;
  }
}

export function BudgetAlerts({
  alerts,
  onDismiss,
  onActionClick,
}: BudgetAlertsProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">No alerts</p>
          <p className="text-sm text-gray-400 mt-1">Your budget is on track</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 flex items-start gap-3 ${getSeverityColor(alert.severity)}`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getSeverityIcon(alert.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{alert.categoryIcon || '📁'}</span>
                    <h4 className={`font-semibold ${getSeverityTextColor(alert.severity)}`}>
                      {alert.categoryName}
                    </h4>
                  </div>
                  <p className={`text-sm mt-1 ${getSeverityTextColor(alert.severity)}`}>
                    {alert.message}
                  </p>
                </div>

                {/* Dismiss Button */}
                {alert.dismissable && onDismiss && (
                  <button
                    onClick={() => onDismiss(alert.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Dismiss alert"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Action Button */}
              {alert.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    alert.action?.onClick();
                    if (onActionClick) {
                      onActionClick(alert);
                    }
                  }}
                  className="mt-3"
                >
                  {alert.action.label}
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
